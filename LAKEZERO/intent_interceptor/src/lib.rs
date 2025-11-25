use wasm_bindgen::prelude::*;
use ed25519_dalek::{Signer, SigningKey};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ValidationRequest<'a> {
    api_key: &'a str,
}

#[derive(Deserialize)]
struct ValidationResponse {
    authorized: bool,
}

#[wasm_bindgen]
pub async fn sign_message(payload: &str, api_key: &str) -> Result<String, String> {
    // 1. Validação Remota
    let client = reqwest::Client::new();
    let req = ValidationRequest { api_key };

    let res = client.post("http://localhost:3000/validate-license")
        .json(&req)
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    let validation: ValidationResponse = res.json()
        .await
        .map_err(|e| format!("Erro ao processar resposta: {}", e))?;

    if !validation.authorized {
        return Err("🚫 ACESSO NEGADO: Chave de API inválida ou não autorizada.".to_string());
    }

    // 2. Assinatura (se autorizado)
    // MVP: Gerando chave efêmera para demonstração.
    // Em produção, recuperaríamos a chave do usuário de forma segura.
    let mut csprng = OsRng;
    let signing_key = SigningKey::generate(&mut csprng);
    
    let signature = signing_key.sign(payload.as_bytes());
    
    Ok(hex::encode(signature.to_bytes()))
}
