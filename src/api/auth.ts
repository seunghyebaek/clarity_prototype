// Auth adapter PLACEHOLDER. No authentication is implemented in this prototype.
// Later: integrate the company SSO session here (e.g. return a bearer token or rely on
// same-site cookies). The backend must derive identity, groups and roles itself.
export interface AuthAdapter {
  /** Headers to attach to API requests. Return {} when using cookie sessions. */
  getAuthHeaders(): Promise<Record<string, string>>;
  /** Called when the API reports session_expired. */
  onSessionExpired(): void;
}

export const authAdapter: AuthAdapter = {
  async getAuthHeaders() {
    return {};
  },
  onSessionExpired() {
    // Placeholder: redirect to the SSO login page once it exists.
  },
};
