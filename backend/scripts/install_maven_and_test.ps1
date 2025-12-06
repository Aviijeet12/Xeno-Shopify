$ErrorActionPreference = 'Stop'
$version = '3.9.6'
$base = Join-Path $env:USERPROFILE '.maven'
$installDir = Join-Path $base "apache-maven-$version"
if (!(Test-Path $installDir)) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    New-Item -ItemType Directory -Path $base -Force | Out-Null
    $zip = Join-Path $base "apache-maven-$version-bin.zip"
    $url = "https://repo1.maven.org/maven2/org/apache/maven/apache-maven/$version/apache-maven-$version-bin.zip"
    Write-Host "Downloading Maven $version..."
    Invoke-WebRequest -Uri $url -OutFile $zip
    if (Test-Path $installDir) {
        Remove-Item -Recurse -Force $installDir
    }
    Expand-Archive -Path $zip -DestinationPath $base -Force
    Remove-Item $zip
}
$mvn = Join-Path $installDir 'bin/mvn.cmd'
& $mvn -version
Set-Location "C:/Users/Avijit Singh/Downloads/shopify-dashboard-ui/backend"
& $mvn -B test
