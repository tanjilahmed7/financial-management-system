import { Clock, CreditCard, DollarSign, TrendingUp } from "lucide-react";

export function AccountCard({ account }) {
    const isPositive = account.balance >= 0;
    const isCredit = account.type === "credit";

    const getAccountIcon = () => {
        switch (account.type) {
            case "checking":
                return <DollarSign className="h-5 w-5" />;
            case "savings":
                return <TrendingUp className="h-5 w-5" />;
            case "credit":
                return <CreditCard className="h-5 w-5" />;
            default:
                return <DollarSign className="h-5 w-5" />;
        }
    };

    const getAccountColor = () => {
        if (isCredit) {
            return "border-l-4 border-l-amber-500";
        }
        return isPositive
            ? "border-l-4 border-l-success"
            : "border-l-4 border-l-destructive";
    };

    const getAccountTypeDisplay = () => {
        switch (account.type) {
            case "checking":
                return "CHEQUING";
            case "savings":
                return "SAVINGS";
            case "credit":
                return "CREDIT";
            default:
                return "ACCOUNT";
        }
    };

    return (
        <div
            className={`bg-card rounded-lg border shadow-sm ${getAccountColor()}`}
        >
            <div className="p-4 pb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {getAccountIcon()}
                        <h3 className="font-semibold text-foreground text-sm">
                            {account.name}
                        </h3>
                    </div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {getAccountTypeDisplay()}
                    </span>
                </div>

                <div className="space-y-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p
                            className={`text-lg font-bold ${
                                isCredit
                                    ? account.balance < 0
                                        ? "text-amber-600"
                                        : "text-success"
                                    : isPositive
                                    ? "text-success"
                                    : "text-destructive"
                            }`}
                        >
                            $
                            {Math.abs(account.balance).toLocaleString("en-CA", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>

                    <div className="flex justify-between text-xs">
                        <div>
                            <p className="text-foreground font-medium">
                                Cleared
                            </p>
                            <p
                                className={`font-semibold ${
                                    isCredit
                                        ? account.clearedBalance < 0
                                            ? "text-amber-600"
                                            : "text-success"
                                        : account.clearedBalance >= 0
                                        ? "text-success"
                                        : "text-destructive"
                                }`}
                            >
                                $
                                {Math.abs(
                                    account.clearedBalance
                                ).toLocaleString("en-CA", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-foreground font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                            </p>
                            <p className="font-semibold text-foreground">
                                {account.pendingTransactions}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
