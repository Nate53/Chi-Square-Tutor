import React, { useState } from 'react';
import { Calculator, CheckCircle, AlertCircle, BookOpen, FlaskConical, Dna, AlertTriangle, TreePine, BarChart3 } from 'lucide-react';

export default function ChiSquareCalculator() {
  const [testType, setTestType] = useState('goodness');
  const [activeTab, setActiveTab] = useState('learn');

  // Goodness of Fit state
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  // Association state
  const [assocScenario, setAssocScenario] = useState(null);
  const [speciesAName, setSpeciesAName] = useState('Species A');
  const [speciesBName, setSpeciesBName] = useState('Species B');
  const [quadratData, setQuadratData] = useState({ bothPresent: 0, onlyA: 0, onlyB: 0, neither: 0 });
  const [showAssocResults, setShowAssocResults] = useState(false);

  // ============ GOODNESS OF FIT ============

  const scenarios = [
    {
      id: 'corn',
      title: 'Dihybrid Cross - Corn Kernels',
      description: 'Testing independent assortment in corn with two traits: color (purple/white) and texture (plump/wrinkled)',
      nullHypothesis: 'The genes for kernel color and texture assort independently (9:3:3:1 ratio)',
      expectedRatio: [9, 3, 3, 1],
      totalObserved: 135,
      categories: [
        { name: 'Purple Plump', expected: 0, observed: 0 },
        { name: 'Purple Wrinkled', expected: 0, observed: 0 },
        { name: 'White Plump', expected: 0, observed: 0 },
        { name: 'White Wrinkled', expected: 0, observed: 0 }
      ]
    },
    {
      id: 'mitosis',
      title: 'Mitosis Phase Distribution',
      description: 'Examining whether cells spend equal time in each phase of mitosis',
      nullHypothesis: 'Cells spend equal time in prophase, metaphase, anaphase, and telophase',
      expectedRatio: [1, 1, 1, 1],
      totalObserved: 200,
      categories: [
        { name: 'Prophase', expected: 0, observed: 0 },
        { name: 'Metaphase', expected: 0, observed: 0 },
        { name: 'Anaphase', expected: 0, observed: 0 },
        { name: 'Telophase', expected: 0, observed: 0 }
      ]
    },
    {
      id: 'interphase',
      title: 'Cell Cycle Phases',
      description: 'Testing the distribution of cells across different cell cycle phases',
      nullHypothesis: 'Cells are distributed according to expected phase durations (70% Interphase, 25% Prophase, 3% Metaphase, 2% other)',
      expectedRatio: [70, 25, 3, 2],
      totalObserved: 200,
      categories: [
        { name: 'Interphase', expected: 0, observed: 0 },
        { name: 'Prophase', expected: 0, observed: 0 },
        { name: 'Metaphase', expected: 0, observed: 0 },
        { name: 'Ana/Telophase', expected: 0, observed: 0 }
      ]
    },
    {
      id: 'peas',
      title: 'Monohybrid Cross - Pea Plants',
      description: 'Testing a 3:1 dominant to recessive ratio in F2 generation',
      nullHypothesis: 'The offspring follow a 3:1 phenotypic ratio (dominant:recessive)',
      expectedRatio: [3, 1],
      totalObserved: 100,
      categories: [
        { name: 'Tall (Dominant)', expected: 0, observed: 0 },
        { name: 'Short (Recessive)', expected: 0, observed: 0 }
      ]
    },
    {
      id: 'blood',
      title: 'Human Blood Types',
      description: 'Testing Hardy-Weinberg equilibrium for ABO blood types in a population',
      nullHypothesis: 'Blood types are in Hardy-Weinberg equilibrium (expected frequencies based on allele frequencies)',
      expectedRatio: [45, 40, 11, 4],
      totalObserved: 200,
      categories: [
        { name: 'Type O', expected: 0, observed: 0 },
        { name: 'Type A', expected: 0, observed: 0 },
        { name: 'Type B', expected: 0, observed: 0 },
        { name: 'Type AB', expected: 0, observed: 0 }
      ]
    }
  ];

  const criticalValues = [
    { df: 1, p005: 3.841, p001: 6.635 },
    { df: 2, p005: 5.991, p001: 9.210 },
    { df: 3, p005: 7.815, p001: 11.345 },
    { df: 4, p005: 9.488, p001: 13.277 },
    { df: 5, p005: 11.070, p001: 15.086 },
    { df: 6, p005: 12.592, p001: 16.812 },
    { df: 7, p005: 14.067, p001: 18.475 }
  ];

  const startScenario = (scenario) => {
    const total = scenario.totalObserved;
    const ratioSum = scenario.expectedRatio.reduce((a, b) => a + b, 0);

    const categoriesWithExpected = scenario.categories.map((cat, idx) => ({
      ...cat,
      expected: (scenario.expectedRatio[idx] / ratioSum) * total,
      observed: 0
    }));

    setCategories(categoriesWithExpected);
    setSelectedScenario(scenario);
    setShowResults(false);
    setCustomMode(false);
  };

  const startCustomScenario = () => {
    setCategories([
      { name: '', expected: 0, observed: 0 },
      { name: '', expected: 0, observed: 0 }
    ]);
    setSelectedScenario({
      id: 'custom',
      title: 'Custom Chi-Square Test',
      description: 'Enter your own observed and expected values',
      nullHypothesis: 'Enter your null hypothesis'
    });
    setShowResults(false);
    setCustomMode(true);
  };

  const updateCategory = (index, field, value) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;
    setCategories(newCategories);
    setShowResults(false);
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', expected: 0, observed: 0 }]);
  };

  const removeCategory = (index) => {
    if (categories.length > 2) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const calculateChiSquare = () => {
    let chiSquare = 0;
    const calculations = categories.map(cat => {
      const deviation = cat.observed - cat.expected;
      const deviationSquared = deviation * deviation;
      const component = deviationSquared / cat.expected;

      return {
        ...cat,
        deviation,
        deviationSquared,
        component
      };
    });

    chiSquare = calculations.reduce((sum, calc) => sum + calc.component, 0);
    const df = categories.length - 1;

    const criticalValue = criticalValues.find(cv => cv.df === df);

    let significance = '';
    let reject = false;

    if (criticalValue) {
      if (chiSquare > criticalValue.p001) {
        significance = 'p < 0.01';
        reject = true;
      } else if (chiSquare > criticalValue.p005) {
        significance = 'p < 0.05';
        reject = true;
      } else {
        significance = 'p > 0.05';
        reject = false;
      }
    }

    return {
      calculations,
      chiSquare,
      df,
      criticalValue,
      significance,
      reject
    };
  };

  const results = showResults ? calculateChiSquare() : null;

  // ============ ASSOCIATION TEST ============

  const assocScenarios = [
    {
      id: 'clover-daisy',
      title: 'Clover and Daisies in a Meadow',
      description: 'Investigating whether white clover and daisies tend to be found together in grassland quadrats',
      speciesA: 'White Clover',
      speciesB: 'Daisy',
      hint: 'Both species prefer similar soil conditions — you might expect a positive association.',
      sampleData: { bothPresent: 15, onlyA: 5, onlyB: 3, neither: 27 }
    },
    {
      id: 'fern-moss',
      title: 'Ferns and Moss on a Forest Floor',
      description: 'Testing whether ferns and moss species co-occur under a woodland canopy',
      speciesA: 'Bracken Fern',
      speciesB: 'Feather Moss',
      hint: 'Both species thrive in shaded, moist conditions — consider whether they compete or coexist.',
      sampleData: { bothPresent: 18, onlyA: 7, onlyB: 9, neither: 16 }
    },
    {
      id: 'grass-plantain',
      title: 'Grass and Plantain Along a Path',
      description: 'Examining whether grasses and plantain are associated in a trampled habitat transect',
      speciesA: 'Ryegrass',
      speciesB: 'Plantain',
      hint: 'Plantain tolerates trampling well. Are they found together or does one replace the other?',
      sampleData: { bothPresent: 4, onlyA: 16, onlyB: 14, neither: 6 }
    }
  ];

  const startAssocScenario = (scenario) => {
    setAssocScenario(scenario);
    setSpeciesAName(scenario.speciesA);
    setSpeciesBName(scenario.speciesB);
    setQuadratData({ bothPresent: 0, onlyA: 0, onlyB: 0, neither: 0 });
    setShowAssocResults(false);
  };

  const startCustomAssoc = () => {
    setAssocScenario({
      id: 'custom',
      title: 'Custom Association Test',
      description: 'Enter your own quadrat sampling data for two species',
      hint: 'Enter the number of quadrats in each category from your fieldwork.'
    });
    setSpeciesAName('Species A');
    setSpeciesBName('Species B');
    setQuadratData({ bothPresent: 0, onlyA: 0, onlyB: 0, neither: 0 });
    setShowAssocResults(false);
  };

  const updateQuadrat = (field, value) => {
    setQuadratData({ ...quadratData, [field]: parseInt(value) || 0 });
    setShowAssocResults(false);
  };

  const calculateAssociation = () => {
    const a = quadratData.bothPresent;
    const b = quadratData.onlyA;
    const c = quadratData.onlyB;
    const d = quadratData.neither;

    const N = a + b + c + d;
    const R1 = a + b; // Species A present row
    const R2 = c + d; // Species A absent row
    const C1 = a + c; // Species B present column
    const C2 = b + d; // Species B absent column

    // Expected values
    const Ea = (R1 * C1) / N;
    const Eb = (R1 * C2) / N;
    const Ec = (R2 * C1) / N;
    const Ed = (R2 * C2) / N;

    // Chi-square calculation: standard (O - E)² / E formula
    const chiComponent = (obs, exp) => ((obs - exp) * (obs - exp)) / exp;

    const compA = chiComponent(a, Ea);
    const compB = chiComponent(b, Eb);
    const compC = chiComponent(c, Ec);
    const compD = chiComponent(d, Ed);

    const chiSquare = compA + compB + compC + compD;

    const df = 1;
    const criticalValue = criticalValues.find(cv => cv.df === 1);

    let significance = '';
    let reject = false;

    if (chiSquare > criticalValue.p001) {
      significance = 'p < 0.01';
      reject = true;
    } else if (chiSquare > criticalValue.p005) {
      significance = 'p < 0.05';
      reject = true;
    } else {
      significance = 'p > 0.05';
      reject = false;
    }

    // Direction of association
    let associationType = 'none';
    if (reject) {
      associationType = a > Ea ? 'positive' : 'negative';
    }

    return {
      observed: { a, b, c, d },
      expected: { Ea, Eb, Ec, Ed },
      components: { compA, compB, compC, compD },
      totals: { R1, R2, C1, C2, N },
      chiSquare,
      df,
      criticalValue,
      significance,
      reject,
      associationType
    };
  };

  const assocResults = showAssocResults ? calculateAssociation() : null;

  // ============ RENDER ============

  const isAssociation = testType === 'association';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-emerald-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-600 p-3 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Chi-Square (χ²) Calculator</h1>
              <p className="text-gray-600 mt-1">AP & IB Biology Statistical Analysis Tool</p>
            </div>
          </div>
        </div>

        {/* Test Type Selector */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Choose Test Type</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setTestType('goodness'); setActiveTab('learn'); }}
              className={`py-4 px-6 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 ${
                testType === 'goodness'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm font-bold">Goodness of Fit</div>
                <div className={`text-xs ${testType === 'goodness' ? 'text-emerald-100' : 'text-gray-400'}`}>
                  Do observed results match expected ratios?
                </div>
              </div>
            </button>
            <button
              onClick={() => { setTestType('association'); setActiveTab('learn'); }}
              className={`py-4 px-6 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 ${
                testType === 'association'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <TreePine className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm font-bold">Test of Association</div>
                <div className={`text-xs ${testType === 'association' ? 'text-indigo-100' : 'text-gray-400'}`}>
                  Are two species associated in quadrats?
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Learn / Practice Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'learn'
                ? (isAssociation ? 'bg-indigo-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md')
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Learn
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'practice'
                ? (isAssociation ? 'bg-indigo-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md')
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            Practice
          </button>
        </div>

        {/* ==================== GOODNESS OF FIT ==================== */}
        {testType === 'goodness' && (
          <>
            {/* Learn Tab */}
            {activeTab === 'learn' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Dna className="w-8 h-8 text-emerald-600" />
                  Understanding the Goodness of Fit Test
                </h2>

                <div className="space-y-6">
                  <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-emerald-900 mb-3">What is the Goodness of Fit Test?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      The chi-square goodness of fit test determines whether observed data differs significantly
                      from what you expected. In biology, we use it to test hypotheses about genetic ratios (e.g.,
                      3:1 or 9:3:3:1), population distributions, and other categorical data. You compare one set of
                      observed counts against a predicted set of expected counts.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">The Chi-Square Formula</h3>
                    <div className="bg-white p-4 rounded-lg my-3 text-center">
                      <p className="text-2xl font-mono text-gray-800">
                        χ² = Σ [(O - E)² / E]
                      </p>
                    </div>
                    <p className="text-gray-700 mb-2">Where:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li><strong>O</strong> = Observed value (what you counted)</li>
                      <li><strong>E</strong> = Expected value (what you predicted)</li>
                      <li><strong>Σ</strong> = Sum of all categories</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-amber-900 mb-3">Step-by-Step Process</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                      <li className="leading-relaxed">
                        <strong>State your null hypothesis:</strong> What ratio or distribution do you expect?
                      </li>
                      <li className="leading-relaxed">
                        <strong>Calculate expected values:</strong> Based on your hypothesis and total sample size
                      </li>
                      <li className="leading-relaxed">
                        <strong>Record observed values:</strong> Count what you actually got in your experiment
                      </li>
                      <li className="leading-relaxed">
                        <strong>Calculate (O - E) for each category:</strong> Find the deviation
                      </li>
                      <li className="leading-relaxed">
                        <strong>Square each deviation:</strong> Calculate (O - E)²
                      </li>
                      <li className="leading-relaxed">
                        <strong>Divide by expected value:</strong> Calculate (O - E)² / E for each category
                      </li>
                      <li className="leading-relaxed">
                        <strong>Sum all values:</strong> Add up all the (O - E)² / E values to get χ²
                      </li>
                      <li className="leading-relaxed">
                        <strong>Determine degrees of freedom:</strong> df = (number of categories) - 1
                      </li>
                      <li className="leading-relaxed">
                        <strong>Compare to critical value:</strong> Check if χ² is significant (typically p = 0.05)
                      </li>
                    </ol>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Interpreting Results</h3>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        <strong>If χ² is LESS than the critical value (p &gt; 0.05):</strong><br/>
                        <span className="ml-4">→ Fail to reject the null hypothesis</span><br/>
                        <span className="ml-4">→ Observed data matches expected ratios</span><br/>
                        <span className="ml-4">→ Differences are due to random chance</span>
                      </p>
                      <p>
                        <strong>If χ² is GREATER than the critical value (p &lt; 0.05):</strong><br/>
                        <span className="ml-4">→ Reject the null hypothesis</span><br/>
                        <span className="ml-4">→ Observed data does NOT match expected ratios</span><br/>
                        <span className="ml-4">→ Differences are statistically significant</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-red-900 mb-3">Common Mistakes to Avoid</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Forgetting to square the deviation before dividing by expected</li>
                      <li>Using proportions instead of actual counts</li>
                      <li>Calculating degrees of freedom incorrectly (remember: df = categories - 1)</li>
                      <li>Confusing "fail to reject" with "accepting" the null hypothesis</li>
                      <li>Not checking that expected values are all ≥ 5 (requirement for valid test)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Tab */}
            {activeTab === 'practice' && (
              <div className="space-y-6">
                {!selectedScenario ? (
                  <>
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Scenario</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {scenarios.map(scenario => (
                          <button
                            key={scenario.id}
                            onClick={() => startScenario(scenario)}
                            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 text-left hover:shadow-lg transition-all hover:border-emerald-400"
                          >
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{scenario.title}</h3>
                            <p className="text-gray-600 text-sm">{scenario.description}</p>
                          </button>
                        ))}
                        <button
                          onClick={startCustomScenario}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-left hover:shadow-lg transition-all hover:border-purple-400"
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Custom Test</h3>
                          <p className="text-gray-600 text-sm">Enter your own data and expected values</p>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Scenario Info */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedScenario.title}</h2>
                          <p className="text-gray-600">{selectedScenario.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedScenario(null);
                            setShowResults(false);
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-colors"
                        >
                          Change Scenario
                        </button>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Null Hypothesis (H₀):</p>
                        <p className="text-gray-700">{selectedScenario.nullHypothesis}</p>
                      </div>
                    </div>

                    {/* Data Entry */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Enter Your Data</h3>

                      <div className="space-y-4">
                        {categories.map((cat, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="grid md:grid-cols-4 gap-4">
                              {customMode ? (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                                  <input
                                    type="text"
                                    value={cat.name}
                                    onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                                    placeholder="e.g., Purple"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                  <div className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-800">
                                    {cat.name}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Expected (E)
                                  {customMode && ' *'}
                                </label>
                                {customMode ? (
                                  <input
                                    type="number"
                                    value={cat.expected || ''}
                                    onChange={(e) => updateCategory(idx, 'expected', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                                    placeholder="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-300 rounded-lg font-semibold text-emerald-900">
                                    {cat.expected.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Observed (O) *</label>
                                <input
                                  type="number"
                                  value={cat.observed || ''}
                                  onChange={(e) => updateCategory(idx, 'observed', parseInt(e.target.value) || 0)}
                                  className="w-full px-4 py-2 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none bg-emerald-50"
                                  placeholder="0"
                                />
                              </div>

                              {customMode && (
                                <div className="flex items-end">
                                  <button
                                    onClick={() => removeCategory(idx)}
                                    disabled={categories.length <= 2}
                                    className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 text-red-700 rounded-lg font-semibold transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {customMode && (
                        <button
                          onClick={addCategory}
                          className="mt-4 px-6 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-semibold transition-colors"
                        >
                          + Add Category
                        </button>
                      )}

                      <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <button
                          onClick={() => setShowResults(true)}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Calculator className="w-6 h-6" />
                          Calculate Chi-Square
                        </button>
                      </div>
                    </div>

                    {/* Results */}
                    {showResults && results && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Calculation Results</h3>

                        {/* Detailed Calculations Table */}
                        <div className="overflow-x-auto mb-6">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-emerald-600 text-white">
                                <th className="px-4 py-3 text-left font-bold">Category</th>
                                <th className="px-4 py-3 text-center font-bold">Expected (E)</th>
                                <th className="px-4 py-3 text-center font-bold">Observed (O)</th>
                                <th className="px-4 py-3 text-center font-bold">O - E</th>
                                <th className="px-4 py-3 text-center font-bold">(O - E)²</th>
                                <th className="px-4 py-3 text-center font-bold">(O - E)² / E</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.calculations.map((calc, idx) => (
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="px-4 py-3 font-semibold text-gray-800">{calc.name}</td>
                                  <td className="px-4 py-3 text-center">{calc.expected.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-center font-semibold">{calc.observed}</td>
                                  <td className="px-4 py-3 text-center">{calc.deviation.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-center">{calc.deviationSquared.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-center bg-emerald-50 font-semibold text-emerald-900">
                                    {calc.component.toFixed(4)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Chi-Square Value */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Chi-Square Value (χ²)</p>
                            <p className="text-4xl font-bold text-blue-900">{results.chiSquare.toFixed(4)}</p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6">
                            <p className="text-sm font-semibold text-purple-900 mb-2">Degrees of Freedom (df)</p>
                            <p className="text-4xl font-bold text-purple-900">{results.df}</p>
                            <p className="text-xs text-purple-700 mt-2">df = number of categories - 1 = {categories.length} - 1 = {results.df}</p>
                          </div>
                        </div>

                        {/* Critical Value Comparison */}
                        {results.criticalValue && (
                          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
                            <h4 className="text-lg font-bold text-amber-900 mb-4">Critical Value Comparison</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-amber-800 mb-1">Critical value at p = 0.05:</p>
                                <p className="text-2xl font-bold text-amber-900">{results.criticalValue.p005.toFixed(3)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-amber-800 mb-1">Critical value at p = 0.01:</p>
                                <p className="text-2xl font-bold text-amber-900">{results.criticalValue.p001.toFixed(3)}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Conclusion */}
                        <div className={`border-l-4 p-6 rounded-r-xl ${
                          results.reject
                            ? 'bg-red-50 border-red-600'
                            : 'bg-green-50 border-green-600'
                        }`}>
                          <div className="flex items-start gap-4">
                            {results.reject ? (
                              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                            ) : (
                              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                            )}
                            <div>
                              <h4 className={`text-xl font-bold mb-2 ${
                                results.reject ? 'text-red-900' : 'text-green-900'
                              }`}>
                                {results.reject ? 'REJECT the Null Hypothesis' : 'FAIL TO REJECT the Null Hypothesis'}
                              </h4>
                              <p className={`mb-3 ${
                                results.reject ? 'text-red-800' : 'text-green-800'
                              }`}>
                                χ² = {results.chiSquare.toFixed(4)}, df = {results.df}, {results.significance}
                              </p>
                              <p className={`leading-relaxed ${
                                results.reject ? 'text-red-900' : 'text-green-900'
                              }`}>
                                {results.reject ? (
                                  <>
                                    The chi-square value <strong>exceeds</strong> the critical value, indicating that the
                                    differences between observed and expected values are <strong>statistically significant</strong>.
                                    The observed data does NOT fit the expected ratio from the null hypothesis. There may be factors
                                    affecting the results beyond random chance.
                                  </>
                                ) : (
                                  <>
                                    The chi-square value is <strong>less than</strong> the critical value, indicating that the
                                    differences between observed and expected values can be attributed to <strong>random chance</strong>.
                                    The observed data fits the expected ratio from the null hypothesis. Your results support
                                    the predicted genetic ratio or distribution.
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ==================== ASSOCIATION TEST ==================== */}
        {testType === 'association' && (
          <>
            {/* Learn Tab */}
            {activeTab === 'learn' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <TreePine className="w-8 h-8 text-indigo-600" />
                  Understanding the Test of Association
                </h2>

                <div className="space-y-6">
                  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-indigo-900 mb-3">What is the Test of Association?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      The chi-square test of association is used in ecology to determine whether two species are
                      associated with each other in a habitat. Using quadrat sampling, you record whether each of
                      two species is present or absent in each quadrat. The test tells you if the two species tend
                      to be found together (<strong>positive association</strong>), tend to avoid each other
                      (<strong>negative association</strong>), or are distributed independently of one another
                      (<strong>no association</strong>).
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-green-900 mb-3">Quadrat Sampling</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Quadrats are square frames (often 0.5m × 0.5m or 1m × 1m) placed randomly in a study area.
                      For each quadrat, you simply record whether each species is <strong>present</strong> or
                      <strong>absent</strong>. You then count how many quadrats fall into each of four categories:
                    </p>
                    <div className="bg-white rounded-lg p-4 overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr>
                            <th className="border-2 border-gray-300 px-4 py-2 bg-gray-100"></th>
                            <th className="border-2 border-gray-300 px-4 py-2 bg-indigo-100 font-bold text-indigo-900">Species B Present</th>
                            <th className="border-2 border-gray-300 px-4 py-2 bg-indigo-100 font-bold text-indigo-900">Species B Absent</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border-2 border-gray-300 px-4 py-2 bg-indigo-100 font-bold text-indigo-900">Species A Present</td>
                            <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold">Both present</td>
                            <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold">Only A</td>
                          </tr>
                          <tr>
                            <td className="border-2 border-gray-300 px-4 py-2 bg-indigo-100 font-bold text-indigo-900">Species A Absent</td>
                            <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold">Only B</td>
                            <td className="border-2 border-gray-300 px-4 py-2 text-center font-semibold">Neither</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">The Null Hypothesis</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>H₀:</strong> There is <strong>no significant association</strong> between the two species.
                      Any overlap or separation in their distributions is due to chance alone. The species are
                      distributed independently of each other.
                    </p>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-amber-900 mb-3">Calculating Expected Values</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      For each cell in the 2×2 table, the expected value is calculated using row and column totals:
                    </p>
                    <div className="bg-white p-4 rounded-lg my-3 text-center">
                      <p className="text-2xl font-mono text-gray-800">
                        E = (Row Total × Column Total) / Grand Total
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                      This gives you the number of quadrats you would expect in each cell if the two species
                      were distributed completely independently of each other.
                    </p>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-orange-900 mb-3">Chi-Square Formula</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Using the standard chi-square formula, calculate the contribution of each cell:
                    </p>
                    <div className="bg-white p-4 rounded-lg my-3 text-center">
                      <p className="text-2xl font-mono text-gray-800">
                        χ² = Σ [(O - E)² / E]
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                      For each cell, find the difference between observed and expected, square it, and divide
                      by the expected value. Sum all four contributions to get your χ² statistic.
                    </p>
                  </div>

                  <div className="bg-violet-50 border-l-4 border-violet-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-violet-900 mb-3">Degrees of Freedom</h3>
                    <div className="bg-white p-4 rounded-lg my-3 text-center">
                      <p className="text-2xl font-mono text-gray-800">
                        df = (rows - 1) × (columns - 1) = (2 - 1) × (2 - 1) = 1
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                      For a 2×2 table, degrees of freedom is always 1. The critical value at p = 0.05 with df = 1
                      is <strong>3.841</strong>.
                    </p>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Interpreting the Result</h3>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        <strong>If χ² &lt; 3.841 (p &gt; 0.05):</strong><br/>
                        <span className="ml-4">→ Fail to reject H₀ — <strong>no significant association</strong></span><br/>
                        <span className="ml-4">→ The two species are distributed independently</span>
                      </p>
                      <p>
                        <strong>If χ² &gt; 3.841 (p &lt; 0.05) — there IS a significant association:</strong>
                      </p>
                      <div className="ml-4 space-y-2">
                        <p className="bg-green-100 p-3 rounded-lg">
                          <strong>Positive association:</strong> The "both present" observed count is <em>greater than</em> expected.
                          The species tend to co-occur — they are found together more often than expected by chance.
                          This could suggest similar habitat requirements or a mutualistic relationship.
                        </p>
                        <p className="bg-red-100 p-3 rounded-lg">
                          <strong>Negative association:</strong> The "both present" observed count is <em>less than</em> expected.
                          The species tend to avoid each other — they are found apart more often than expected.
                          This could suggest competition, different habitat preferences, or allelopathy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-red-900 mb-3">Common Mistakes to Avoid</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Using the wrong formula — IB uses the standard (O - E)² / E formula, not Yates' correction</li>
                      <li>Using frequency/percentage data instead of actual quadrat counts</li>
                      <li>Using df = 3 (number of cells minus 1) instead of df = 1 for a 2×2 table</li>
                      <li>Forgetting to determine the <em>direction</em> of association after a significant result</li>
                      <li>Having fewer than 20 quadrats total (small samples make the test unreliable)</li>
                      <li>Not checking that all expected values are ≥ 5</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Tab */}
            {activeTab === 'practice' && (
              <div className="space-y-6">
                {!assocScenario ? (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose an Ecology Scenario</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {assocScenarios.map(scenario => (
                        <button
                          key={scenario.id}
                          onClick={() => startAssocScenario(scenario)}
                          className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 text-left hover:shadow-lg transition-all hover:border-indigo-400"
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{scenario.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{scenario.description}</p>
                          <p className="text-indigo-600 text-xs italic">{scenario.hint}</p>
                        </button>
                      ))}
                      <button
                        onClick={startCustomAssoc}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-left hover:shadow-lg transition-all hover:border-purple-400"
                      >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Custom Test</h3>
                        <p className="text-gray-600 text-sm">Enter your own quadrat sampling data for two species</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Scenario Info */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">{assocScenario.title}</h2>
                          <p className="text-gray-600">{assocScenario.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setAssocScenario(null);
                            setShowAssocResults(false);
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-colors"
                        >
                          Change Scenario
                        </button>
                      </div>

                      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mb-3">
                        <p className="text-sm font-semibold text-indigo-900 mb-1">Null Hypothesis (H₀):</p>
                        <p className="text-gray-700">
                          There is no significant association between {speciesAName} and {speciesBName}.
                          The two species are distributed independently of each other.
                        </p>
                      </div>

                      {assocScenario.hint && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                          <p className="text-sm text-amber-800"><strong>Hint:</strong> {assocScenario.hint}</p>
                        </div>
                      )}
                    </div>

                    {/* Data Entry - 2x2 Contingency Table */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Quadrat Data</h3>
                      <p className="text-gray-600 text-sm mb-6">
                        Enter the number of quadrats in each category.
                        {assocScenario.sampleData && (
                          <button
                            onClick={() => {
                              setQuadratData(assocScenario.sampleData);
                              setShowAssocResults(false);
                            }}
                            className="ml-2 text-indigo-600 hover:text-indigo-800 underline font-semibold"
                          >
                            Load sample data
                          </button>
                        )}
                      </p>

                      {/* Species Name Inputs */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Species A Name</label>
                          <input
                            type="text"
                            value={speciesAName}
                            onChange={(e) => { setSpeciesAName(e.target.value); setShowAssocResults(false); }}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-indigo-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Species B Name</label>
                          <input
                            type="text"
                            value={speciesBName}
                            onChange={(e) => { setSpeciesBName(e.target.value); setShowAssocResults(false); }}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-indigo-50"
                          />
                        </div>
                      </div>

                      {/* 2x2 Table Input */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 border-2 border-gray-300 bg-gray-100 w-1/4"></th>
                              <th className="px-4 py-3 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold w-1/4">
                                {speciesBName} Present
                              </th>
                              <th className="px-4 py-3 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold w-1/4">
                                {speciesBName} Absent
                              </th>
                              <th className="px-4 py-3 border-2 border-gray-300 bg-gray-200 font-bold text-gray-700 w-1/4">
                                Row Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold">
                                {speciesAName} Present
                              </td>
                              <td className="px-2 py-2 border-2 border-gray-300">
                                <input
                                  type="number"
                                  value={quadratData.bothPresent || ''}
                                  onChange={(e) => updateQuadrat('bothPresent', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none text-center font-semibold text-lg bg-indigo-50"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td className="px-2 py-2 border-2 border-gray-300">
                                <input
                                  type="number"
                                  value={quadratData.onlyA || ''}
                                  onChange={(e) => updateQuadrat('onlyA', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none text-center font-semibold text-lg bg-indigo-50"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-gray-50 text-center font-bold text-gray-700 text-lg">
                                {quadratData.bothPresent + quadratData.onlyA}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold">
                                {speciesAName} Absent
                              </td>
                              <td className="px-2 py-2 border-2 border-gray-300">
                                <input
                                  type="number"
                                  value={quadratData.onlyB || ''}
                                  onChange={(e) => updateQuadrat('onlyB', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none text-center font-semibold text-lg bg-indigo-50"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td className="px-2 py-2 border-2 border-gray-300">
                                <input
                                  type="number"
                                  value={quadratData.neither || ''}
                                  onChange={(e) => updateQuadrat('neither', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none text-center font-semibold text-lg bg-indigo-50"
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-gray-50 text-center font-bold text-gray-700 text-lg">
                                {quadratData.onlyB + quadratData.neither}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-gray-200 font-bold text-gray-700">
                                Column Total
                              </td>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-gray-50 text-center font-bold text-gray-700 text-lg">
                                {quadratData.bothPresent + quadratData.onlyB}
                              </td>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-gray-50 text-center font-bold text-gray-700 text-lg">
                                {quadratData.onlyA + quadratData.neither}
                              </td>
                              <td className="px-4 py-3 border-2 border-gray-300 bg-indigo-200 text-center font-bold text-indigo-900 text-lg">
                                N = {quadratData.bothPresent + quadratData.onlyA + quadratData.onlyB + quadratData.neither}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <button
                          onClick={() => setShowAssocResults(true)}
                          disabled={quadratData.bothPresent + quadratData.onlyA + quadratData.onlyB + quadratData.neither === 0}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Calculator className="w-6 h-6" />
                          Calculate Chi-Square
                        </button>
                      </div>
                    </div>

                    {/* Association Results */}
                    {showAssocResults && assocResults && (
                      <div className="bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Calculation Results</h3>

                        {/* Expected Values Table */}
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-700 mb-3">Observed vs Expected Values</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr>
                                  <th className="px-3 py-2 border-2 border-gray-300 bg-gray-100"></th>
                                  <th className="px-3 py-2 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold">
                                    {speciesBName} Present
                                  </th>
                                  <th className="px-3 py-2 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold">
                                    {speciesBName} Absent
                                  </th>
                                  <th className="px-3 py-2 border-2 border-gray-300 bg-gray-200 font-bold">Row Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold">
                                    {speciesAName} Present
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 text-center">
                                    <div className="font-bold text-lg">{assocResults.observed.a}</div>
                                    <div className="text-xs text-gray-500">Expected: {assocResults.expected.Ea.toFixed(2)}</div>
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 text-center">
                                    <div className="font-bold text-lg">{assocResults.observed.b}</div>
                                    <div className="text-xs text-gray-500">Expected: {assocResults.expected.Eb.toFixed(2)}</div>
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-gray-50 text-center font-bold">
                                    {assocResults.totals.R1}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-indigo-100 text-indigo-900 font-bold">
                                    {speciesAName} Absent
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 text-center">
                                    <div className="font-bold text-lg">{assocResults.observed.c}</div>
                                    <div className="text-xs text-gray-500">Expected: {assocResults.expected.Ec.toFixed(2)}</div>
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 text-center">
                                    <div className="font-bold text-lg">{assocResults.observed.d}</div>
                                    <div className="text-xs text-gray-500">Expected: {assocResults.expected.Ed.toFixed(2)}</div>
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-gray-50 text-center font-bold">
                                    {assocResults.totals.R2}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-gray-200 font-bold">Column Total</td>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-gray-50 text-center font-bold">
                                    {assocResults.totals.C1}
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-gray-50 text-center font-bold">
                                    {assocResults.totals.C2}
                                  </td>
                                  <td className="px-3 py-2 border-2 border-gray-300 bg-indigo-200 text-center font-bold text-indigo-900">
                                    N = {assocResults.totals.N}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Step-by-step calculation */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                          <h4 className="text-lg font-bold text-gray-700 mb-3">Step-by-Step Calculation</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr className="bg-indigo-600 text-white">
                                  <th className="px-3 py-2 text-left font-bold">Cell</th>
                                  <th className="px-3 py-2 text-center font-bold">O</th>
                                  <th className="px-3 py-2 text-center font-bold">E</th>
                                  <th className="px-3 py-2 text-center font-bold">O - E</th>
                                  <th className="px-3 py-2 text-center font-bold">(O - E)²</th>
                                  <th className="px-3 py-2 text-center font-bold">(O - E)² / E</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { label: `Both present`, o: assocResults.observed.a, e: assocResults.expected.Ea, comp: assocResults.components.compA },
                                  { label: `${speciesAName} only`, o: assocResults.observed.b, e: assocResults.expected.Eb, comp: assocResults.components.compB },
                                  { label: `${speciesBName} only`, o: assocResults.observed.c, e: assocResults.expected.Ec, comp: assocResults.components.compC },
                                  { label: `Neither present`, o: assocResults.observed.d, e: assocResults.expected.Ed, comp: assocResults.components.compD }
                                ].map((row, idx) => {
                                  const deviation = row.o - row.e;
                                  return (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                      <td className="px-3 py-2 font-semibold text-gray-800">{row.label}</td>
                                      <td className="px-3 py-2 text-center font-semibold">{row.o}</td>
                                      <td className="px-3 py-2 text-center">{row.e.toFixed(2)}</td>
                                      <td className="px-3 py-2 text-center">{deviation.toFixed(2)}</td>
                                      <td className="px-3 py-2 text-center">{(deviation * deviation).toFixed(4)}</td>
                                      <td className="px-3 py-2 text-center bg-indigo-50 font-semibold text-indigo-900">
                                        {row.comp.toFixed(4)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Chi-Square Value */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-xl p-5">
                            <p className="text-sm font-semibold text-indigo-900 mb-1">χ² Calculated Value</p>
                            <p className="text-3xl font-bold text-indigo-900">{assocResults.chiSquare.toFixed(4)}</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-5">
                            <p className="text-sm font-semibold text-purple-900 mb-1">Degrees of Freedom</p>
                            <p className="text-3xl font-bold text-purple-900">df = 1</p>
                            <p className="text-xs text-purple-700 mt-1">(2-1) × (2-1) = 1</p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5">
                            <p className="text-sm font-semibold text-amber-900 mb-1">Critical Value (p = 0.05)</p>
                            <p className="text-3xl font-bold text-amber-900">3.841</p>
                            <p className="text-xs text-amber-700 mt-1">p = 0.01: 6.635</p>
                          </div>
                        </div>

                        {/* Warning if expected values < 5 */}
                        {(assocResults.expected.Ea < 5 || assocResults.expected.Eb < 5 || assocResults.expected.Ec < 5 || assocResults.expected.Ed < 5) && (
                          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-yellow-900">Warning: Expected value below 5</p>
                              <p className="text-yellow-800 text-sm">
                                One or more expected values is less than 5. The chi-square test may not be reliable
                                with these data. Consider collecting more quadrat samples.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Conclusion */}
                        <div className={`border-l-4 p-6 rounded-r-xl ${
                          assocResults.reject
                            ? 'bg-red-50 border-red-600'
                            : 'bg-green-50 border-green-600'
                        }`}>
                          <div className="flex items-start gap-4">
                            {assocResults.reject ? (
                              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                            ) : (
                              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                            )}
                            <div>
                              <h4 className={`text-xl font-bold mb-2 ${
                                assocResults.reject ? 'text-red-900' : 'text-green-900'
                              }`}>
                                {assocResults.reject ? 'REJECT the Null Hypothesis' : 'FAIL TO REJECT the Null Hypothesis'}
                              </h4>
                              <p className={`mb-3 ${
                                assocResults.reject ? 'text-red-800' : 'text-green-800'
                              }`}>
                                χ² = {assocResults.chiSquare.toFixed(4)}, df = 1, {assocResults.significance}
                              </p>

                              {assocResults.reject ? (
                                <div>
                                  <p className="text-red-900 leading-relaxed mb-4">
                                    The chi-square value <strong>exceeds</strong> the critical value. There is a
                                    <strong> statistically significant association</strong> between {speciesAName} and {speciesBName}.
                                  </p>

                                  <div className={`p-4 rounded-lg ${
                                    assocResults.associationType === 'positive'
                                      ? 'bg-green-100 border-2 border-green-400'
                                      : 'bg-orange-100 border-2 border-orange-400'
                                  }`}>
                                    <p className={`font-bold text-lg mb-1 ${
                                      assocResults.associationType === 'positive' ? 'text-green-900' : 'text-orange-900'
                                    }`}>
                                      {assocResults.associationType === 'positive' ? 'Positive Association' : 'Negative Association'}
                                    </p>
                                    <p className={
                                      assocResults.associationType === 'positive' ? 'text-green-800' : 'text-orange-800'
                                    }>
                                      {assocResults.associationType === 'positive' ? (
                                        <>
                                          Observed "both present" ({assocResults.observed.a}) is <strong>greater than</strong> expected
                                          ({assocResults.expected.Ea.toFixed(2)}). {speciesAName} and {speciesBName} tend
                                          to <strong>co-occur</strong> — they are found together more often than expected by chance.
                                          This could indicate similar habitat requirements or a mutualistic relationship.
                                        </>
                                      ) : (
                                        <>
                                          Observed "both present" ({assocResults.observed.a}) is <strong>less than</strong> expected
                                          ({assocResults.expected.Ea.toFixed(2)}). {speciesAName} and {speciesBName} tend
                                          to <strong>avoid each other</strong> — they are found apart more often than expected.
                                          This could indicate competition, different habitat preferences, or allelopathy.
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-green-900 leading-relaxed">
                                  The chi-square value is <strong>less than</strong> the critical value. There is
                                  <strong> no significant association</strong> between {speciesAName} and {speciesBName}.
                                  The two species appear to be <strong>distributed independently</strong> of each other —
                                  any observed overlap or separation is likely due to random chance.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
