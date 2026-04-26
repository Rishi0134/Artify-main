const FIXED_ADMIN_ACCOUNTS = [
  {
    name: "Madhvi Tandel",
    email: "madhvitandel@gmail.com",
    password: "Madhvi@123",
  },
  {
    name: "Havan Tandel",
    email: "havantandel@gmail.com",
    password: "Havan@123",
  },
];

const FIXED_ADMIN_EMAILS = new Set(
  FIXED_ADMIN_ACCOUNTS.map((account) => account.email.toLowerCase())
);

const isFixedAdminEmail = (email = "") =>
  FIXED_ADMIN_EMAILS.has(String(email).trim().toLowerCase());

module.exports = {
  FIXED_ADMIN_ACCOUNTS,
  FIXED_ADMIN_EMAILS,
  isFixedAdminEmail,
};
