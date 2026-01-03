// Simple stable hash → 0..99
function bucketFor(flagKey, seed, userIdentifier) {
  const input = `${flagKey}|${seed}|${userIdentifier}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

export async function isFeatureEnabled(base44, flagKey, user) {
  const flags = await base44.asServiceRole.entities.FeatureFlag.filter({ flag_key: flagKey });
  const flag = flags?.[0];
  if (!flag) return { enabled: false, config: null };

  // Kill switch
  if (flag.force_state === "force_off") return { enabled: false, config: flag.config ?? null };
  if (flag.force_state === "force_on") return { enabled: true, config: flag.config ?? null };

  if (!flag.is_enabled) return { enabled: false, config: flag.config ?? null };

  const userEmail = user.user_email ?? "";
  const userId = user.user_id ?? "";

  // Overrides
  if (userEmail) {
    const overrides = await base44.asServiceRole.entities.FeatureFlagOverride.filter({ flag_key: flagKey, user_email: userEmail });
    const override = overrides?.[0];
    if (override) {
      if (override.expires_at && new Date(override.expires_at) < new Date()) {
        // expired override - treat as none (optional: auto-delete)
      } else {
        return { enabled: override.state === "force_on", config: flag.config ?? null };
      }
    }
  }

  // Target users
  if (flag.target_users === "clients" && user.role !== "client") return { enabled: false, config: flag.config ?? null };
  if (flag.target_users === "cleaners" && user.role !== "cleaner") return { enabled: false, config: flag.config ?? null };
  if (flag.target_users === "admins" && user.role !== "admin") return { enabled: false, config: flag.config ?? null };
  // beta_users logic can be added when needed

  // Rollout
  const seed = flag.rollout_seed ?? "default";
  const strat = flag.rollout_strategy ?? "user_email_hash";
  const identifier = strat === "user_id_hash" ? userId : userEmail;
  if (!identifier) return { enabled: false, config: flag.config ?? null };

  const bucket = bucketFor(flagKey, seed, identifier);
  const pct = Number(flag.rollout_percentage ?? 0);

  return { enabled: bucket < pct, config: flag.config ?? null };
}