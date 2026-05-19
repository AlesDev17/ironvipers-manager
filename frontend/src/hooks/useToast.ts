export function useToast() {
  const success = (message: string) => {
    alert(`✓ ${message}`)
  }

  const error = (message: string) => {
    alert(`Error: ${message}`)
  }

  const info = (message: string) => {
    alert(message)
  }

  return { success, error, info }
}
