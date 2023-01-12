interface BotConfig {
  /**
   * Only accept messages send by yourself
   */
  onlyMe: boolean;
  /**
   * Indicates whether the bot responds to commands from any groups it is an added member of or just the groups in `enabledIds`
   *
   * `false`: Accepts commands from any group/contact
   *
   * `true`: Accepts commands only from groups/contact in `enabledIds`
   */
  private: boolean;
  /**
   * List of ids the bot will work in
   */
  enabledIds: string[];
  /**
   * List of banned ids, where the bot will not work
   */
  bannedIds: string[];
}

export default {
  onlyMe: true,
  private: false,
  enabledIds: [],
  bannedIds: [],
} as BotConfig;
