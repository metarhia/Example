# Generate certificates

## Certbot (for production)

- Let's Encrypt is a free certificate authority: https://letsencrypt.org/
- Use Certbot (free tool for automatically using Let’s Encrypt certificates on
  manually-administrated websites to enable HTTPS): https://certbot.eff.org/

```
dnf -y install certbot
certbot certonly --standalone -d www.domain.com -d domain.com -m your.name@domain.com --agree-tos --no-eff-email
yes | cp /etc/letsencrypt/live/domain.com/fullchain.pem ~/domain.com/application/cert/cert.pem
yes | cp /etc/letsencrypt/live/domain.com/privkey.pem ~/domain.com/application/cert/key.pem
```

Or use impress web server for challenge exchange:

```
certbot certonly --webroot -w ~/domain.com/application/static -d www.domain.com -d domain.com -m your.name@domain.com --agree-tos --no-eff-email
```

## Self-signed (for testing)

- Run `./generate.sh` in this directory
