const checkSubscription = async (user) => {
  if (
    user.subscriptionPlan !== "free" &&
    user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt <= new Date()
  ) {
    user.subscriptionPlan = "free";
    user.subscriptionExpiresAt = null;
    await user.save();
  }

  return user;
};

module.exports = checkSubscription;