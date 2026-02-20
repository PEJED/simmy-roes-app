import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { DIRECTION_INFO, type Direction } from '../../utils/flowValidation';

const Step1Direction: React.FC = () => {
  const { setDirection, setStep, direction } = useWizard();

  const handleSelect = (dir: Direction) => {
    setDirection(dir);
    setStep(2);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Επιλογή Κατεύθυνσης</h2>
      <p className="text-gray-600">
        Επιλέξτε την κατεύθυνσή σας για να δείτε τους έγκυρους συνδυασμούς ροών.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(DIRECTION_INFO).map(([key, info]) => (
          <button
            key={key}
            onClick={() => handleSelect(key as Direction)}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              direction === key
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {info.name}
            </h3>
            <p className="text-sm text-gray-500">
              {info.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step1Direction;
