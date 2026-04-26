const User = require("../models/User");
const { FIXED_ADMIN_ACCOUNTS, FIXED_ADMIN_EMAILS } = require("../config/adminAccounts");

const syncFixedAdmins = async () => {
  const fixedAdminEmails = Array.from(FIXED_ADMIN_EMAILS);

  for (const account of FIXED_ADMIN_ACCOUNTS) {
    const normalizedEmail = account.email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      await User.create({
        name: account.name,
        email: normalizedEmail,
        password: account.password,
        role: "admin",
        isBlocked: false,
        isDeleted: false,
      });
      continue;
    }

    user.name = account.name;
    user.role = "admin";
    user.isBlocked = false;
    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;

    // Keep fixed admin passwords in sync with requested credentials.
    user.password = account.password;
    await user.save();
  }

  // Ensure only system-fixed accounts retain admin role.
  await User.updateMany(
    {
      role: "admin",
      email: { $nin: fixedAdminEmails },
    },
    { $set: { role: "user" } }
  );
};

module.exports = { syncFixedAdmins };
