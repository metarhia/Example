# Generate certificates

## Certbot (for production)

- Let's Encrypt is a free certificate authority: https://letsencrypt.org/
- Use Certbot (free tool for automatically using Let’s Encrypt certificates on
  manually-administrated websites to enable HTTPS): https://certbot.eff.org/

```
dnf -y install certbot
sudo certbot certonly --standalone
```
or
```
curl -O https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
./certbot-auto certonly
```

## Self-signed (for testing)

- Run `./generate.sh` in this directory
