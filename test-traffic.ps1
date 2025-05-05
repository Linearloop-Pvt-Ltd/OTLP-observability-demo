# Function to make HTTP requests
function Invoke-Request {
    param (
        [string]$Url,
        [int]$Count = 1,
        [int]$DelayMs = 100
    )
    
    for ($i = 1; $i -le $Count; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
            Write-Host "Request to $Url - Status: $($response.StatusCode)"
        }
        catch {
            Write-Host "Request to $Url - Error: $($_.Exception.Message)"
        }
        Start-Sleep -Milliseconds $DelayMs
    }
}

# Base URL
$baseUrl = "http://localhost:3000"

Write-Host "`n=== Starting Traffic Test ===`n"

# Phase 1: Normal Traffic (30 seconds)
Write-Host "Phase 1: Normal Traffic (30 seconds)"
for ($i = 1; $i -le 30; $i++) {
    Invoke-Request -Url "$baseUrl/api/hello" -Count 1 -DelayMs 1000
    Invoke-Request -Url "$baseUrl/health" -Count 1 -DelayMs 1000
}

# Phase 2: High Load (20 seconds)
Write-Host "`nPhase 2: High Load (20 seconds)"
for ($i = 1; $i -le 20; $i++) {
    Invoke-Request -Url "$baseUrl/api/users" -Count 1 -DelayMs 100
    Invoke-Request -Url "$baseUrl/api/hello" -Count 1 -DelayMs 100
}

# Phase 3: Error Conditions (15 seconds)
Write-Host "`nPhase 3: Error Conditions (15 seconds)"
for ($i = 1; $i -le 15; $i++) {
    Invoke-Request -Url "$baseUrl/api/error" -Count 1 -DelayMs 1000
    Invoke-Request -Url "$baseUrl/api/not-found" -Count 1 -DelayMs 1000
}

# Phase 4: Mixed Traffic (30 seconds)
Write-Host "`nPhase 4: Mixed Traffic (30 seconds)"
for ($i = 1; $i -le 30; $i++) {
    $random = Get-Random -Minimum 1 -Maximum 5
    switch ($random) {
        1 { Invoke-Request -Url "$baseUrl/api/hello" -Count 1 -DelayMs 500 }
        2 { Invoke-Request -Url "$baseUrl/api/users" -Count 1 -DelayMs 500 }
        3 { Invoke-Request -Url "$baseUrl/api/error" -Count 1 -DelayMs 500 }
        4 { Invoke-Request -Url "$baseUrl/api/not-found" -Count 1 -DelayMs 500 }
    }
}

Write-Host "`n=== Traffic Test Complete ===`n" 