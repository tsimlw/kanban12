param(
    [string]$Message = "I am your IT assistant, how can I help you?"
)

$ErrorActionPreference = "Stop"

try {
    Add-Type -AssemblyName System.Speech
    $synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $synthesizer.Rate = 0
    $synthesizer.Volume = 100
    $synthesizer.Speak($Message)
    $synthesizer.Dispose()

    @{
        hook         = "chatbot-voice-greeting"
        event        = "chatbot_click"
        voiceMessage = $Message
        status       = "spoken"
    } | ConvertTo-Json -Compress
} catch {
    @{
        hook         = "chatbot-voice-greeting"
        event        = "chatbot_click"
        voiceMessage = $Message
        status       = "error"
        error        = $_.Exception.Message
    } | ConvertTo-Json -Compress
    exit 1
}
