/* ==========================================================================
   Contact form settings — the ONLY file to edit to connect the form.

   While "endpoint" is empty, the form does NOT send anything. It checks the
   visitor's answers and prepares their request as text, which they send to
   the company themselves by WhatsApp or by email (using the phone number and
   email address already published on this website). The page says so clearly.

   To deliver submissions automatically, paste the form endpoint URL from your
   form delivery service (for example Formspree, Web3Forms, Getform or your
   own server) into "endpoint". The form then POSTs the fields below and shows
   "sent" only when the service confirms receipt (HTTP 2xx).

   Fields posted: name, organisation, phone, email, location, service, details,
   language, page — plus anything in "extraFields" (e.g. an access key or
   a subject line some services require).
   ========================================================================== */
window.ALBAHRANY_FORM = {
  endpoint: '',
  extraFields: {},

  // Hand-off while no endpoint is set (both already published on the site).
  whatsappNumber: '9647734114077',
  handoffEmail: 'Mahmood@albahranygroup.com'
};
