param(
    [string]$BaseUrl = "https://xeno-shopify-peuv.onrender.com",
    [string]$AdminEmail = "admin@xeno.com",
    [string]$AdminPassword = $env:ADMIN_PASSWORD,
    [string]$ShopDomain = "xeno-demo-2030.myshopify.com",
    [string]$ShopAccessToken = $env:SHOPIFY_ACCESS_TOKEN,
    [string]$ContactEmail = "avijitpratapsin@gmail.com"
)

if (-not $AdminPassword) {
    throw "Missing admin password. Set ADMIN_PASSWORD or pass -AdminPassword."
}

if (-not $ShopAccessToken) {
    throw "Missing Shopify access token. Set SHOPIFY_ACCESS_TOKEN or pass -ShopAccessToken."
}

$ErrorActionPreference = "Stop"

function Show-ErrorBody($exception) {
    if ($exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Warning "Response body: $body"
    }
}

function Write-Section($title) {
    Write-Host "`n=== $title ===" -ForegroundColor Cyan
}

Write-Section "1. Logging in"
$loginBody = @{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" -Body $loginBody
$loginResponse | ConvertTo-Json -Depth 5

$token = $loginResponse.data.token
if (-not $token) {
    throw "Login failed: token missing"
}

$authHeaders = @{ Authorization = "Bearer $token" }

Write-Section "2. Onboarding tenant"
$onboardBody = @{ shopDomain = $ShopDomain; accessToken = $ShopAccessToken; contactEmail = $ContactEmail } | ConvertTo-Json
try {
    $onboardResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/tenants/onboard" -Headers $authHeaders -ContentType "application/json" -Body $onboardBody
    $onboardResponse | ConvertTo-Json -Depth 5
    $tenantId = $onboardResponse.data.id
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Warning "Tenant already exists; fetching id from tenant list"
        $existingTenants = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/tenants" -Headers $authHeaders
        $tenantId = $existingTenants.data | Where-Object { $_.shop_domain -eq $ShopDomain } | Select-Object -First 1 -ExpandProperty id
        if (-not $tenantId) { throw "Existing tenant not found after 409 response" }
    } else {
        throw
    }
}

if (-not $tenantId) {
    throw "Tenant id unavailable"
}

Write-Section "3. Triggering sync"
try {
    $syncResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/tenants/$tenantId/sync" -Headers $authHeaders -ContentType "application/json"
    $syncResponse | ConvertTo-Json -Depth 5
} catch {
    Show-ErrorBody $_.Exception
    throw
}

Write-Section "4. Listing tenants"
try {
    $tenants = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/tenants" -Headers $authHeaders
    $tenants | ConvertTo-Json -Depth 5
} catch {
    Show-ErrorBody $_.Exception
    throw
}
