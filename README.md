# DayyBox Railway

siap deploy ke Railway.

## endpoint
- GET `/` = halaman uploader
- GET `/api/health` = cek app hidup
- GET `/api/upload` = penjelasan cara pakai upload
- POST `/api/upload` = upload file
- GET `/api/list` = list file
- DELETE `/api/delete?filename=...` = hapus file

## contoh upload via api
```bash
curl -X POST "https://domain-lu/api/upload" \
  -H "Authorization: Bearer dayy_super_secret_key" \
  -F "file=@/storage/emulated/0/Download/test.jpg"
```

## cara deploy ke Railway
1. extract zip ini
2. upload semua isi project ke repo GitHub baru
3. login Railway
4. New Project
5. Deploy from GitHub Repo
6. pilih repo ini
7. tunggu build selesai
8. buka service lu
9. Settings -> Networking -> Public Networking -> Generate Domain

Railway tidak otomatis kasih domain, tapi domain bawaan `*.up.railway.app` bisa dibuat dari Settings service melalui `Generate Domain`. Custom domain juga bisa ditambah dari Settings dan Railway otomatis provision SSL untuk custom domain. citeturn0search0turn0search3

## custom domain
kalau mau pakai domain sendiri:
1. service -> Settings
2. Networking -> Public Networking
3. + Custom Domain
4. Railway bakal kasih target CNAME
5. pasang CNAME itu di DNS provider lu
6. tunggu verifikasi

Railway docs bilang custom domain diverifikasi dengan CNAME target yang mereka kasih, dan SSL akan dipasang otomatis setelah DNS benar. citeturn0search0turn0search1

## variables di Railway
- `API_KEY=dayy_super_secret_key`
- `APP_NAME=DayyBox Railway`

## catatan
kalau domain lu pakai Cloudflare, hati-hati sama proxy/orange cloud karena ada caveat khusus di docs Railway untuk domain proxied. citeturn0search0turn0search1
