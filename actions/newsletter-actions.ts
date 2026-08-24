'use server'

export async function subscribeToNewsletter(
  _prevState: unknown,
  _formData: FormData
) {
  return {
    success: false,
    message: "Newsletter signup is not available yet.",
    validating: false
  }
}
