# FinPulse Database Setup Script
# Purpose: Install PostgreSQL (if needed), create finpulse database, and apply schema
# Run as Administrator in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FinPulse Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: This script should ideally run as Administrator for Chocolatey install." -ForegroundColor Yellow
    Write-Host "If psql installation fails, re-run this script as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check if psql is available
Write-Host "Step 1: Checking for psql..." -ForegroundColor Green
$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Source
if ($psqlPath) {
    Write-Host "✓ psql found at: $psqlPath" -ForegroundColor Green
} else {
    Write-Host "✗ psql not found. Attempting to install PostgreSQL via Chocolatey..." -ForegroundColor Yellow
    
    # Check if Chocolatey is installed
    $chocoPath = (Get-Command choco -ErrorAction SilentlyContinue).Source
    if (-not $chocoPath) {
        Write-Host "Installing Chocolatey..." -ForegroundColor Green
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    Write-Host "Installing PostgreSQL via Chocolatey (this may take a few minutes)..." -ForegroundColor Green
    choco install postgresql --confirm
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    # Verify psql is now available
    $psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Source
    if ($psqlPath) {
        Write-Host "✓ psql installed successfully at: $psqlPath" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install psql. Please install PostgreSQL manually from https://www.postgresql.org/download/windows/" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Configuring database credentials..." -ForegroundColor Green

# Prompt for postgres password
$securePassword = Read-Host "Enter PostgreSQL postgres user password" -AsSecureString
$PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($securePassword))
$env:PGPASSWORD = $PGPASSWORD

$PGHOST = 'localhost'
$PGUSER = 'postgres'
$DBNAME = 'finpulse'
$SCHEMAFILE = 'C:\Users\Sachin Singh\OneDrive\Desktop\CMT\finPulse_noext.sql'

Write-Host "Host: $PGHOST" -ForegroundColor Cyan
Write-Host "User: $PGUSER" -ForegroundColor Cyan
Write-Host "Database: $DBNAME" -ForegroundColor Cyan
Write-Host "Schema file: $SCHEMAFILE" -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 3: Testing connection..." -ForegroundColor Green

try {
    $result = psql -h $PGHOST -U $PGUSER -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Connection successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Connection failed. Check your credentials and PostgreSQL server status." -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error connecting to PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Creating database '$DBNAME' (if it doesn't exist)..." -ForegroundColor Green

try {
    $dbExists = psql -h $PGHOST -U $PGUSER -tc "SELECT 1 FROM pg_database WHERE datname='$DBNAME';" 2>&1
    if ($dbExists -match '1') {
        Write-Host "✓ Database '$DBNAME' already exists" -ForegroundColor Green
    } else {
        psql -h $PGHOST -U $PGUSER -c "CREATE DATABASE $DBNAME;" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database '$DBNAME' created successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to create database" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "✗ Error creating database: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 5: Applying schema from $SCHEMAFILE..." -ForegroundColor Green

if (-not (Test-Path $SCHEMAFILE)) {
    Write-Host "✗ Schema file not found: $SCHEMAFILE" -ForegroundColor Red
    exit 1
}

try {
    psql -h $PGHOST -U $PGUSER -d $DBNAME -f $SCHEMAFILE 2>&1 | Out-String | Tee-Object -Variable schemaOutput
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Schema applied successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to apply schema. Check error messages above." -ForegroundColor Red
        Write-Host $schemaOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error applying schema: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 6: Verifying tables..." -ForegroundColor Green

try {
    Write-Host ""
    Write-Host "Tables created:" -ForegroundColor Cyan
    psql -h $PGHOST -U $PGUSER -d $DBNAME -c "\dt" 2>&1
    
    Write-Host ""
    Write-Host "Sample data - Assets:" -ForegroundColor Cyan
    psql -h $PGHOST -U $PGUSER -d $DBNAME -c "SELECT id, symbol, name, current_price FROM assets LIMIT 5;" 2>&1
    
    Write-Host ""
    Write-Host "Sample data - Users:" -ForegroundColor Cyan
    psql -h $PGHOST -U $PGUSER -d $DBNAME -c "SELECT * FROM users LIMIT 5;" 2>&1
} catch {
    Write-Host "✗ Error verifying tables: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database 'finpulse' is ready to use." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Connect your application to finpulse database" -ForegroundColor Cyan
Write-Host "2. (Optional) Apply original schema with pgcrypto:" -ForegroundColor Cyan
Write-Host "   psql -h localhost -U postgres -d finpulse -f 'C:\Users\Sachin Singh\OneDrive\Desktop\CMT\finPulse.sql'" -ForegroundColor Cyan
Write-Host ""
