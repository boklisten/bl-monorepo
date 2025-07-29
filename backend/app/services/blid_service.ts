import CryptoService from "#services/crypto_service";

const BlidService = {
  createUserBlid(provider: string, providerId: string) {
    return "u#" + CryptoService.cipher(provider + providerId);
  },
};
export default BlidService;
