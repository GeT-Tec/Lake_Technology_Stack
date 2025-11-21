use wasm_bindgen::prelude::*;
use ed25519_dalek::{Signer, SigningKey};
use rand_core::OsRng;

#[wasm_bindgen]
pub fn sign_message(payload: &str, api_key: &str) -> Result<String, String> {
    if api_key != "LAKE-GOLD-LICENSE-2025" {
        return Err("🚫 ACESSO NEGADO: Chave de API inválida. Contate Dom Gustavo Lago.".to_string());
    }

    // MVP: Gerando chave efêmera para demonstração.
    // Em produção, recuperaríamos a chave do usuário de forma segura.
    let mut csprng = OsRng;
    let signing_key = SigningKey::generate(&mut csprng);
    
    let signature = signing_key.sign(payload.as_bytes());
    
    Ok(hex::encode(signature.to_bytes()))
}
