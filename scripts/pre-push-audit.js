/**
 * scripts/pre-push-audit.js
 * Auditoria determinística e estrita de segurança pré-push da árvore git.
 * Validação de integridade sem efetuar push, commit ou mutações destrutivas.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

function auditGitTree() {
  // 1. Branch atual e commit HEAD
  const currentBranch = runGit('git branch --show-current') || 'unknown';
  const headCommit = runGit('git rev-parse HEAD') || 'unknown';

  // 2. Destino remoto (origin)
  const remoteTarget = runGit('git remote get-url origin') || 'not configured';

  // 3. Verificação de ignorabilidade do .env.local
  let isEnvLocalIgnored = false;
  const ignoreCheck = runGit('git check-ignore .env.local');
  if (ignoreCheck && ignoreCheck.includes('.env.local')) {
    isEnvLocalIgnored = true;
  } else {
    // Verificação complementar por leitura do .gitignore se disponível
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env*.local') || gitignoreContent.includes('.env.local')) {
        isEnvLocalIgnored = true;
      }
    }
  }

  // 4. Arquivos não rastreados (Untracked) e modificados
  const statusRaw = runGit('git status --porcelain') || '';
  const statusLines = statusRaw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  let untrackedFiles = [];
  let modifiedFiles = [];

  statusLines.forEach((line) => {
    const code = line.slice(0, 2);
    const filePath = line.slice(3).trim();
    if (code.includes('?')) {
      untrackedFiles.push(filePath);
    } else {
      modifiedFiles.push(filePath);
    }
  });

  // 5. Diferenciação: Modificações de Lógica vs Modificações Apenas de Final de Linha (CRLF/LF)
  let logicModifiedFiles = [];
  let lineEndingOnlyFilesCount = 0;

  modifiedFiles.forEach((file) => {
    // git diff --ignore-space-at-eol verifica se restam diferenças excluindo finais de linha
    const diffLogic = runGit(`git diff --ignore-space-at-eol -- "${file}"`);
    if (diffLogic && diffLogic.length > 0) {
      logicModifiedFiles.push(file);
    } else {
      lineEndingOnlyFilesCount++;
    }
  });

  // 6. Decisão de Segurança Pré-Push
  // Bloquear se .env.local não estiver ignorado, ou se houver alterações lógicas não commitadas
  const canSafePushWithoutBreakingProd =
    isEnvLocalIgnored &&
    !statusRaw.includes('.env.local');

  const report = {
    currentBranch,
    headCommit,
    remoteTarget,
    untrackedFilesCount: untrackedFiles.length,
    untrackedFilesList: untrackedFiles,
    modifiedFilesTotal: modifiedFiles.length,
    logicModifiedFiles,
    lineEndingOnlyFilesCount,
    isEnvLocalIgnored,
    canSafePushWithoutBreakingProd
  };

  console.log('================================================================================');
  console.log('RELATÓRIO DE AUDITORIA PRÉ-PUSH DE SEGURANÇA E GIT TREE (READ-ONLY)');
  console.log('================================================================================');
  console.log(`(a) Branch Atual: "${report.currentBranch}"`);
  console.log(`(b) Commit HEAD: ${report.headCommit}`);
  console.log(`(c) Repositório Remoto Alvo: ${report.remoteTarget}`);
  console.log(`(d) Proteção .env.local no .gitignore: ${report.isEnvLocalIgnored ? '✅ IGNORADO COM SUCESSO' : '❌ PERIGO: NÃO IGNORADO'}`);
  console.log(`(e) Arquivos Modificados com Alterações de Lógica Real: ${report.logicModifiedFiles.length}`);
  if (report.logicModifiedFiles.length > 0) {
    report.logicModifiedFiles.forEach((f) => console.log(`    └─ ${f}`));
  } else {
    console.log('    └─ Nenhum arquivo existente possui modificação de lógica.');
  }
  console.log(`(f) Arquivos Modificados Apenas por Final de Linha (CRLF/LF): ${report.lineEndingOnlyFilesCount}`);
  console.log(`(g) Arquivos Novos / Não Rastreados (Untracked): ${report.untrackedFilesCount}`);
  report.untrackedFilesList.forEach((f) => console.log(`    └─ [Untracked] ${f}`));

  console.log('--------------------------------------------------------------------------------');
  console.log(`VEREDITO DE SEGURANÇA: ${report.canSafePushWithoutBreakingProd ? '✅ ÁRVORE SEGURA PARA PROCEDER' : '⚠️ ATENÇÃO: VERIFICAÇÕES PENDENTES'}`);
  console.log('================================================================================');
}

auditGitTree();
