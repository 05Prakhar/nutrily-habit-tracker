
interface DailyTotalsProps {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const DailyTotals = ({ totals }: DailyTotalsProps) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-gray-900 mb-2">Daily Totals</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-emerald-600">{totals.calories}</span> calories
        </div>
        <div>
          <span className="font-medium text-blue-600">{totals.protein}g</span> protein
        </div>
        <div>
          <span className="font-medium text-amber-600">{totals.carbs}g</span> carbs
        </div>
        <div>
          <span className="font-medium text-red-600">{totals.fats}g</span> fats
        </div>
      </div>
    </div>
  );
};
