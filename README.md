# Smart Room Nepal

# Generating private and public keys for JWT

## Generate private key

```bash
openssl genrsa \
-out jwt-private-key.pem \
2048
```

## Generate public key

```bash
openssl rsa -in jwt-private-key.pem \
-pubout \
-outform PEM \
-out jwt-public-key.pem
```
