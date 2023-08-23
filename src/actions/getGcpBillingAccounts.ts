import { cliSync } from "../utils/cli.js";

export const getGcpBillingAccounts = () => {
  const accounts = JSON.parse(cliSync(`gcloud beta billing accounts list --format=json`));
  return accounts
    .filter(({ open }: { open: boolean }) => open)
    .map((account: { name: string; displayName: string }) => ({
      value: account.name,
      name: account.displayName,
    }));
};
