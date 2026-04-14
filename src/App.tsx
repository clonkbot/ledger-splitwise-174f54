import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id, Doc } from "../convex/_generated/dataModel";

// Types
type Group = Doc<"groups"> & { memberCount: number };
type GroupMember = Doc<"groupMembers"> & { user: Doc<"users"> | null };
type GroupWithMembers = Doc<"groups"> & { members: GroupMember[] };
type ExpenseSplit = Doc<"expenseSplits"> & { user: Doc<"users"> | null };
type Expense = Doc<"expenses"> & {
  paidByUser: Doc<"users"> | null;
  splits: ExpenseSplit[];
};
type Balance = {
  userId: string;
  user: Doc<"users"> | null;
  balance: number;
};

// Format cents to dollars
const formatMoney = (cents: number) => {
  const dollars = Math.abs(cents) / 100;
  return `$${dollars.toFixed(2)}`;
};

// Auth component
function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D2A26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#2D5A47] mb-4 md:mb-6 shadow-lg">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-[#F9F6F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#2D2A26] mb-2">Ledger</h1>
          <p className="text-[#6B6560] text-sm md:text-base">Split expenses with elegance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-[#E8E4DE]">
          <h2 className="font-serif text-xl md:text-2xl text-[#2D2A26] mb-6">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-[#C75C4D] text-sm bg-[#C75C4D]/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2D5A47] text-white rounded-lg font-medium hover:bg-[#234939] transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? "Please wait..." : flow === "signIn" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E4DE] text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-[#B8734C] hover:text-[#9A5F3D] text-sm font-medium transition-colors"
            >
              {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <button
          onClick={() => signIn("anonymous")}
          className="w-full mt-4 py-3 px-4 bg-transparent border border-[#D4CFC7] text-[#6B6560] rounded-lg font-medium hover:bg-white hover:border-[#B8734C] transition-all"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const groups = useQuery(api.groups.list);
  const overallBalance = useQuery(api.balances.getOverallBalance);
  const [selectedGroupId, setSelectedGroupId] = useState<Id<"groups"> | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);

  if (selectedGroupId) {
    return <GroupDetail groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DE] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2D5A47] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#F9F6F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-serif text-xl md:text-2xl text-[#2D2A26]">Ledger</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B6560] hidden sm:block truncate max-w-[150px]">
              {user?.email || "Guest"}
            </span>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 text-sm text-[#6B6560] hover:text-[#2D2A26] hover:bg-[#F5F2EC] rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-8">
        {/* Balance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-[#E8E4DE] shadow-sm">
            <p className="text-sm text-[#6B6560] mb-1">You are owed</p>
            <p className="font-serif text-2xl md:text-3xl text-[#2D5A47]">
              {formatMoney(overallBalance?.totalOwed ?? 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E4DE] shadow-sm">
            <p className="text-sm text-[#6B6560] mb-1">You owe</p>
            <p className="font-serif text-2xl md:text-3xl text-[#C75C4D]">
              {formatMoney(overallBalance?.totalOwing ?? 0)}
            </p>
          </div>
        </div>

        {/* Groups Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-[#2D2A26]">Your Groups</h2>
          <button
            onClick={() => setShowNewGroup(true)}
            className="px-4 py-2 bg-[#B8734C] text-white rounded-lg text-sm font-medium hover:bg-[#9A5F3D] transition-colors shadow-sm"
          >
            + New Group
          </button>
        </div>

        {showNewGroup && (
          <NewGroupForm onClose={() => setShowNewGroup(false)} />
        )}

        {/* Groups List */}
        <div className="space-y-3">
          {groups === undefined ? (
            <div className="text-center py-12 text-[#6B6560]">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E8E4DE]">
              <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#B8734C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-[#6B6560] mb-4">No groups yet</p>
              <button
                onClick={() => setShowNewGroup(true)}
                className="text-[#B8734C] hover:text-[#9A5F3D] font-medium"
              >
                Create your first group
              </button>
            </div>
          ) : (
            groups.map((group: Group) => (
              <button
                key={group._id}
                onClick={() => setSelectedGroupId(group._id)}
                className="w-full bg-white rounded-xl p-4 md:p-5 border border-[#E8E4DE] hover:border-[#B8734C] hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-serif text-lg"
                    style={{ backgroundColor: group.color || "#2D5A47" }}
                  >
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#2D2A26] group-hover:text-[#B8734C] transition-colors truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-[#6B6560]">
                      {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[#D4CFC7] group-hover:text-[#B8734C] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// New Group Form
function NewGroupForm({ onClose }: { onClose: () => void }) {
  const createGroup = useMutation(api.groups.create);
  const [loading, setLoading] = useState(false);

  const colors = ["#2D5A47", "#B8734C", "#4A6FA5", "#7B5E7B", "#C75C4D", "#5B8A72"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const color = formData.get("color") as string;

    await createGroup({ name, description: description || undefined, color });
    setLoading(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#B8734C] shadow-lg mb-6 animate-fadeIn">
      <h3 className="font-serif text-lg text-[#2D2A26] mb-4">Create New Group</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Group Name</label>
          <input
            name="name"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
            placeholder="Apartment, Trip to Paris, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Description (optional)</label>
          <input
            name="description"
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
            placeholder="Monthly shared expenses"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color, i) => (
              <label key={color} className="cursor-pointer">
                <input type="radio" name="color" value={color} defaultChecked={i === 0} className="sr-only peer" />
                <div
                  className="w-10 h-10 rounded-lg peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-[#2D2A26] transition-all"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-[#E8E4DE] text-[#6B6560] rounded-lg font-medium hover:bg-[#F5F2EC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#2D5A47] text-white rounded-lg font-medium hover:bg-[#234939] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Group Detail View
function GroupDetail({ groupId, onBack }: { groupId: Id<"groups">; onBack: () => void }) {
  const group = useQuery(api.groups.get, { groupId });
  const expenses = useQuery(api.expenses.listByGroup, { groupId });
  const balances = useQuery(api.balances.getGroupBalances, { groupId });
  const user = useQuery(api.users.currentUser);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "balances">("expenses");

  if (!group) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
        <div className="text-[#6B6560]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DE] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-[#F5F2EC] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-serif text-lg flex-shrink-0"
              style={{ backgroundColor: group.color || "#2D5A47" }}
            >
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-xl text-[#2D2A26] truncate">{group.name}</h1>
              <p className="text-sm text-[#6B6560]">
                {group.members.length} {group.members.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex-1 min-w-[120px] px-4 py-3 bg-[#B8734C] text-white rounded-lg text-sm font-medium hover:bg-[#9A5F3D] transition-colors shadow-sm"
          >
            + Add Expense
          </button>
          <button
            onClick={() => setShowSettle(true)}
            className="flex-1 min-w-[120px] px-4 py-3 bg-[#2D5A47] text-white rounded-lg text-sm font-medium hover:bg-[#234939] transition-colors shadow-sm"
          >
            Settle Up
          </button>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-3 border border-[#E8E4DE] text-[#6B6560] rounded-lg text-sm font-medium hover:bg-white hover:border-[#B8734C] transition-all"
          >
            + Member
          </button>
        </div>

        {/* Forms */}
        {showAddExpense && (
          <AddExpenseForm
            groupId={groupId}
            members={group.members}
            onClose={() => setShowAddExpense(false)}
          />
        )}
        {showAddMember && (
          <AddMemberForm groupId={groupId} onClose={() => setShowAddMember(false)} />
        )}
        {showSettle && user && (
          <SettleForm
            groupId={groupId}
            members={group.members}
            currentUserId={user._id}
            onClose={() => setShowSettle(false)}
          />
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#E8E4DE] mb-6">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "expenses"
                ? "border-[#B8734C] text-[#B8734C]"
                : "border-transparent text-[#6B6560] hover:text-[#2D2A26]"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab("balances")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "balances"
                ? "border-[#B8734C] text-[#B8734C]"
                : "border-transparent text-[#6B6560] hover:text-[#2D2A26]"
            }`}
          >
            Balances
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            {expenses === undefined ? (
              <div className="text-center py-12 text-[#6B6560]">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[#E8E4DE]">
                <p className="text-[#6B6560]">No expenses yet</p>
              </div>
            ) : (
              expenses.map((expense: Expense) => (
                <ExpenseCard key={expense._id} expense={expense} currentUserId={user?._id} />
              ))
            )}
          </div>
        )}

        {activeTab === "balances" && (
          <div className="space-y-3">
            {balances === undefined ? (
              <div className="text-center py-12 text-[#6B6560]">Loading...</div>
            ) : (
              balances.map((balance: Balance) => (
                <div
                  key={balance.userId}
                  className="bg-white rounded-xl p-4 border border-[#E8E4DE] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#6B6560] font-medium">
                      {(balance.user?.email?.charAt(0) || "?").toUpperCase()}
                    </div>
                    <span className="text-[#2D2A26] truncate max-w-[150px] md:max-w-none">
                      {balance.user?.email || "Unknown"}
                    </span>
                  </div>
                  <span
                    className={`font-serif text-lg ${
                      balance.balance > 0
                        ? "text-[#2D5A47]"
                        : balance.balance < 0
                        ? "text-[#C75C4D]"
                        : "text-[#6B6560]"
                    }`}
                  >
                    {balance.balance > 0 ? "+" : ""}
                    {formatMoney(balance.balance)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Expense Card
function ExpenseCard({ expense, currentUserId }: { expense: any; currentUserId?: Id<"users"> }) {
  const deleteExpense = useMutation(api.expenses.remove);
  const isCreator = expense.createdBy === currentUserId;
  const date = new Date(expense.createdAt);

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E8E4DE] hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-[#2D2A26] truncate">{expense.description}</h4>
            {expense.category && (
              <span className="text-xs px-2 py-0.5 bg-[#F5F2EC] text-[#6B6560] rounded-full flex-shrink-0">
                {expense.category}
              </span>
            )}
          </div>
          <p className="text-sm text-[#6B6560]">
            Paid by{" "}
            <span className="text-[#2D2A26]">
              {expense.paidBy === currentUserId ? "you" : expense.paidByUser?.email || "Unknown"}
            </span>
          </p>
          <p className="text-xs text-[#A09A93] mt-1">
            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-serif text-xl text-[#B8734C]">{formatMoney(expense.amount)}</p>
          {isCreator && (
            <button
              onClick={() => deleteExpense({ expenseId: expense._id })}
              className="text-xs text-[#C75C4D] hover:underline mt-1"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Expense Form
function AddExpenseForm({
  groupId,
  members,
  onClose,
}: {
  groupId: Id<"groups">;
  members: any[];
  onClose: () => void;
}) {
  const createExpense = useMutation(api.expenses.create);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const description = formData.get("description") as string;
    const amountDollars = parseFloat(formData.get("amount") as string);
    const category = formData.get("category") as string;

    const amountCents = Math.round(amountDollars * 100);
    const splitAmount = Math.floor(amountCents / members.length);
    const remainder = amountCents - splitAmount * members.length;

    const splits = members.map((m, i) => ({
      userId: m.userId,
      amount: splitAmount + (i < remainder ? 1 : 0),
    }));

    await createExpense({
      groupId,
      description,
      amount: amountCents,
      category: category || undefined,
      splitType: "equal",
      splits,
    });
    setLoading(false);
    onClose();
  };

  const categories = ["Food", "Transport", "Utilities", "Entertainment", "Shopping", "Other"];

  return (
    <div className="bg-white rounded-xl p-5 border border-[#B8734C] shadow-lg mb-6 animate-fadeIn">
      <h3 className="font-serif text-lg text-[#2D2A26] mb-4">Add Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Description</label>
          <input
            name="description"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
            placeholder="Dinner at restaurant"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Amount ($)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            inputMode="decimal"
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
            placeholder="25.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Category</label>
          <select
            name="category"
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-[#6B6560] bg-[#F5F2EC] px-3 py-2 rounded-lg">
          Split equally among {members.length} members
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-[#E8E4DE] text-[#6B6560] rounded-lg font-medium hover:bg-[#F5F2EC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#B8734C] text-white rounded-lg font-medium hover:bg-[#9A5F3D] transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Add Member Form
function AddMemberForm({ groupId, onClose }: { groupId: Id<"groups">; onClose: () => void }) {
  const addMember = useMutation(api.groups.addMember);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await addMember({ groupId, email });
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#B8734C] shadow-lg mb-6 animate-fadeIn">
      <h3 className="font-serif text-lg text-[#2D2A26] mb-4">Add Member</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Email Address</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#B8734C] focus:ring-2 focus:ring-[#B8734C]/20 transition-all text-[#2D2A26]"
            placeholder="friend@example.com"
          />
        </div>
        <p className="text-sm text-[#6B6560]">
          The user must have an account to be added
        </p>
        {error && (
          <p className="text-[#C75C4D] text-sm bg-[#C75C4D]/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-[#E8E4DE] text-[#6B6560] rounded-lg font-medium hover:bg-[#F5F2EC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#2D5A47] text-white rounded-lg font-medium hover:bg-[#234939] transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Settle Form
function SettleForm({
  groupId,
  members,
  currentUserId,
  onClose,
}: {
  groupId: Id<"groups">;
  members: any[];
  currentUserId: Id<"users">;
  onClose: () => void;
}) {
  const createSettlement = useMutation(api.settlements.create);
  const [loading, setLoading] = useState(false);

  const otherMembers = members.filter((m) => m.userId !== currentUserId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const toUser = formData.get("toUser") as Id<"users">;
    const amountDollars = parseFloat(formData.get("amount") as string);
    const note = formData.get("note") as string;

    const amountCents = Math.round(amountDollars * 100);

    await createSettlement({
      groupId,
      toUser,
      amount: amountCents,
      note: note || undefined,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#2D5A47] shadow-lg mb-6 animate-fadeIn">
      <h3 className="font-serif text-lg text-[#2D2A26] mb-4">Settle Up</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Pay to</label>
          <select
            name="toUser"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#2D5A47] focus:ring-2 focus:ring-[#2D5A47]/20 transition-all text-[#2D2A26]"
          >
            <option value="">Select member</option>
            {otherMembers.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.email || "Unknown"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Amount ($)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            inputMode="decimal"
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#2D5A47] focus:ring-2 focus:ring-[#2D5A47]/20 transition-all text-[#2D2A26]"
            placeholder="50.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6B6560] mb-1.5">Note (optional)</label>
          <input
            name="note"
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4DE] bg-[#FDFCFA] focus:outline-none focus:border-[#2D5A47] focus:ring-2 focus:ring-[#2D5A47]/20 transition-all text-[#2D2A26]"
            placeholder="Venmo payment"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-[#E8E4DE] text-[#6B6560] rounded-lg font-medium hover:bg-[#F5F2EC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-[#2D5A47] text-white rounded-lg font-medium hover:bg-[#234939] transition-colors disabled:opacity-50"
          >
            {loading ? "Recording..." : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-6 text-center border-t border-[#E8E4DE] bg-[#FDFCFA]">
      <p className="text-xs text-[#A09A93]">
        Requested by <span className="text-[#6B6560]">@web-user</span> · Built by <span className="text-[#6B6560]">@clonkbot</span>
      </p>
    </footer>
  );
}

// Main App
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#B8734C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <Dashboard />;
}
