<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Console\Command;

class RecalculateAccountBalances extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounts:recalculate-balances';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate account balances based on actual transactions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Recalculating account balances...');

        $accounts = Account::all();
        $totalAccounts = $accounts->count();
        $updatedAccounts = 0;

        foreach ($accounts as $account) {
            $this->line("Processing account: {$account->name}");

            // Calculate total balance from all transactions
            $totalBalance = $account->transactions()->sum('amount');
            
            // Calculate cleared balance from cleared transactions
            $clearedBalance = $account->transactions()
                ->where('status', 'cleared')
                ->sum('amount');

            // Update the account
            $account->update([
                'balance' => $totalBalance,
                'cleared_balance' => $clearedBalance,
            ]);

            $this->line("  - Old balance: {$account->getOriginal('balance')}");
            $this->line("  - New balance: {$totalBalance}");
            $this->line("  - Old cleared: {$account->getOriginal('cleared_balance')}");
            $this->line("  - New cleared: {$clearedBalance}");

            $updatedAccounts++;
        }

        $this->info("Successfully updated {$updatedAccounts}/{$totalAccounts} accounts.");
        
        // Show final account balances
        $this->info("\nFinal Account Balances:");
        Account::all()->each(function ($account) {
            $this->line("  {$account->name}: \${$account->balance} (cleared: \${$account->cleared_balance})");
        });

        return Command::SUCCESS;
    }
}
