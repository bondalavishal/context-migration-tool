import { useState } from 'react'

// Step components (stubs for now — built out in subsequent phases)
import Landing from './steps/Landing.jsx'
import ApiKeyInput from './steps/ApiKeyInput.jsx'
import Upload from './steps/Upload.jsx'
import Processing from './steps/Processing.jsx'
import Output from './steps/Output.jsx'

export const STEPS = {
  LANDING: 'landing',
  API_KEY: 'api_key',
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  OUTPUT: 'output',
}

export default function App() {
  const [step, setStep] = useState(STEPS.LANDING)
  const [apiKey, setApiKey] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [detectedPlatform, setDetectedPlatform] = useState(null)
  const [result, setResult] = useState(null)

  const ctx = {
    apiKey, setApiKey,
    uploadedFile, setUploadedFile,
    detectedPlatform, setDetectedPlatform,
    result, setResult,
    goTo: setStep,
    STEPS,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {step === STEPS.LANDING    && <Landing    {...ctx} />}
      {step === STEPS.API_KEY    && <ApiKeyInput {...ctx} />}
      {step === STEPS.UPLOAD     && <Upload      {...ctx} />}
      {step === STEPS.PROCESSING && <Processing  {...ctx} />}
      {step === STEPS.OUTPUT     && <Output      {...ctx} />}
    </div>
  )
}
