# GitHub'a Push Etme Adımları

## 1. Git Repository Başlatma

```bash
git init
```

## 2. Tüm Dosyaları Ekleme

```bash
git add .
```

## 3. İlk Commit

```bash
git commit -m "Initial commit: KIEL-AI-FULL platform with file upload and pagination features"
```

## 4. GitHub Repository Oluşturma

GitHub'da yeni bir repository oluşturun:
1. GitHub.com'a gidin
2. "New repository" butonuna tıklayın
3. Repository adını girin (örn: `kiel-ai-full`)
4. Public veya Private seçin
5. "Create repository" butonuna tıklayın

## 5. Remote Ekleme ve Push

GitHub repository URL'inizi aldıktan sonra:

```bash
# Remote ekle (YOUR_USERNAME ve YOUR_REPO_NAME'i değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Veya SSH kullanıyorsanız:
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Branch adını main olarak ayarla
git branch -M main

# Push et
git push -u origin main
```

## Alternatif: Mevcut Repository Varsa

Eğer zaten bir GitHub repository'niz varsa:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Notlar

- `.env` dosyaları `.gitignore`'da olduğu için push edilmeyecek
- `node_modules/` klasörleri push edilmeyecek
- `uploads/` klasörü push edilmeyecek (dosyalar sunucuda oluşturulacak)
- GitHub credentials için Personal Access Token kullanmanız gerekebilir

