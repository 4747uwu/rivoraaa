import React, { useState } from 'react';
import { 
  BarChart3, Table, FileSpreadsheet, Lightbulb, List, 
  Sparkles, Database, PieChart, X, ChevronRight, ChevronDown,
  AlertTriangle, Check, AlertCircle, Code, ArrowUpRight,
  Download, LayoutGrid, Bot
} from 'lucide-react';

const ExcelAnalysisViewer = ({ 
  isOpen,
  onClose,
  analysis, 
  file, 
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    insights: true,
    formulas: false,
    dataQuality: false,
    visualizations: false
  });

  // Early returns
  if (!isOpen) return null;
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FileSpreadsheet className="mr-2" size={20} />
              Excel Analysis
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin mb-4">
                <BarChart3 size={40} className="text-blue-500" />
              </div>
              <p className="text-gray-600">Analyzing Excel file...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis && !file) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Excel Analysis</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 text-center text-gray-500">
            <AlertCircle size={40} className="mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-medium mb-1">No Analysis Data Available</h3>
            <p className="text-gray-500">Unable to load analysis for this file.</p>
          </div>
        </div>
      </div>
    );
  }

  // Combine all insights
  const insights = analysis?.aiInsights || file?.excelAnalysis || analysis;
  
  // Helper for section toggling
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Section component for collapsible content
  const Section = ({ title, icon, id, children, iconColor, expandByDefault = true }) => {
    const [isExpanded, setIsExpanded] = useState(expandByDefault);
    
    return (
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div 
          className="flex justify-between items-center p-3 bg-white cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-base font-medium text-gray-800 flex items-center">
            {React.cloneElement(icon, { className: `mr-2 ${iconColor || 'text-gray-600'}` })}
            {title}
          </h3>
          {isExpanded ? 
            <ChevronDown size={18} className="text-gray-400" /> : 
            <ChevronRight size={18} className="text-gray-400" />
          }
        </div>
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-100">{children}</div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileSpreadsheet size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Excel Analysis</h2>
              <p className="text-sm text-gray-500">
                {file?.name || 'Spreadsheet Analysis'} • {new Date(analysis?.processedAt || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'insights' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Sparkles size={16} className="mr-1" />
                AI Insights
              </div>
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'structure' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Database size={16} className="mr-1" />
                Data Structure
              </div>
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'optimization' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 size={16} className="mr-1" />
                Optimization
              </div>
            </button>
            <button
              onClick={() => setActiveTab('formulas')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'formulas' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Code size={16} className="mr-1" />
                Formulas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('visualize')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'visualize' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <PieChart size={16} className="mr-1" />
                Visualizations
              </div>
            </button>
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {/* Dataset Summary */}
              <Section 
                title="Dataset Summary" 
                icon={<Bot size={18} />} 
                iconColor="text-purple-500"
              >
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-gray-700">{insights?.dataSummary || insights?.datasetSummary || "No summary available"}</p>
                </div>
              </Section>

              {/* Key Insights */}
              {(insights?.keyInsights?.length > 0) && (
                <Section 
                  title="Key Insights" 
                  icon={<Lightbulb size={18} />} 
                  iconColor="text-amber-500"
                >
                  <ul className="space-y-2">
                    {insights.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex">
                        <div className="text-amber-500 mr-3 mt-0.5">•</div>
                        <div className="text-gray-700">{insight}</div>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Suggested Queries */}
              {(insights?.suggestedQueries?.length > 0 || insights?.dataQueries?.length > 0) && (
                <Section 
                  title="Suggested Queries" 
                  icon={<List size={18} />} 
                  iconColor="text-blue-500"
                >
                  <ul className="space-y-2">
                    {(insights?.suggestedQueries || insights?.dataQueries || []).map((query, idx) => (
                      <li key={idx} className="p-2 bg-blue-50 rounded-md">
                        <div className="flex">
                          <div className="text-blue-500 mr-2">?</div>
                          <div className="text-gray-700">{query}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}

          {/* Data Structure Tab */}
          {activeTab === 'structure' && (
            <div className="space-y-4">
              <Section 
                title="File Structure" 
                icon={<Database size={18} />} 
                iconColor="text-gray-600"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded flex justify-between">
                    <span className="text-gray-600">Sheets</span>
                    <span className="font-medium">{analysis?.sheetCount || 0}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded flex justify-between">
                    <span className="text-gray-600">Rows</span>
                    <span className="font-medium">{analysis?.rowCount || 0}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded flex justify-between">
                    <span className="text-gray-600">Columns</span>
                    <span className="font-medium">{analysis?.columnCount || 0}</span>
                  </div>
                </div>
              </Section>

              {/* Sheet Details */}
              {analysis?.sheets?.length > 0 && (
                <Section 
                  title="Sheet Details" 
                  icon={<LayoutGrid size={18} />} 
                  iconColor="text-indigo-500"
                >
                  <div className="space-y-3">
                    {analysis.sheets.map((sheet, index) => (
                      <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-indigo-50 p-3 flex justify-between items-center">
                          <span className="font-medium text-indigo-700">{sheet.name}</span>
                          <div className="flex space-x-3">
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                              {sheet.rowCount} rows
                            </span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                              {sheet.columnCount} columns
                            </span>
                          </div>
                        </div>
                        
                        {sheet.headers?.length > 0 && (
                          <div className="p-3 bg-white">
                            <div className="text-xs text-gray-500 mb-1">Columns:</div>
                            <div className="flex flex-wrap gap-1">
                              {sheet.headers.map((header, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {header}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-4">
              {/* Data Inconsistencies */}
              {(analysis?.inconsistencies?.length > 0 || insights?.dataInconsistencies?.length > 0) && (
                <Section 
                  title="Data Issues" 
                  icon={<AlertTriangle size={18} />} 
                  iconColor="text-red-500"
                >
                  <div className="space-y-2">
                    {(analysis?.inconsistencies || insights?.dataInconsistencies || []).map((issue, idx) => (
                      <div key={idx} className="flex p-3 bg-red-50 rounded-md">
                        <AlertCircle className="text-red-500 mr-2 shrink-0 mt-0.5" size={16} />
                        <div className="text-gray-700">{issue}</div>
                      </div>
                    ))}
                    {(analysis?.inconsistencies?.length === 0 && insights?.dataInconsistencies?.length === 0) && (
                      <div className="p-3 bg-green-50 rounded-md flex">
                        <Check className="text-green-500 mr-2" size={16} />
                        <div className="text-green-700">No major data inconsistencies found</div>
                      </div>
                    )}
                  </div>
                </Section>
              )}
              
              {/* Optimization Suggestions */}
              <Section 
                title="Optimization Suggestions" 
                icon={<ArrowUpRight size={18} />} 
                iconColor="text-green-600"
              >
                {(analysis?.optimizationSuggestions?.length > 0) ? (
                  <ul className="space-y-2">
                    {(analysis?.optimizationSuggestions || []).map((suggestion, idx) => (
                      <li key={idx} className="flex p-3 bg-green-50 rounded-md">
                        <div className="text-green-600 mr-2 shrink-0 mt-0.5">•</div>
                        <div className="text-gray-700">{suggestion}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md text-gray-500">
                    No optimization suggestions available
                  </div>
                )}
              </Section>

              {/* Data Cleaning */}
              {(insights?.dataCleaning?.length > 0 || insights?.cleaningTips?.length > 0) && (
                <Section 
                  title="Data Cleaning Tips" 
                  icon={<Check size={18} />} 
                  iconColor="text-blue-500"
                >
                  <ul className="space-y-2">
                    {(insights?.dataCleaning || insights?.cleaningTips || []).map((tip, idx) => (
                      <li key={idx} className="flex p-3 bg-blue-50 rounded-md">
                        <div className="text-blue-600 mr-2 shrink-0 mt-0.5">•</div>
                        <div className="text-gray-700">{tip}</div>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}

          {/* Formulas Tab */}
          {activeTab === 'formulas' && (
            <div className="space-y-4">
              {/* Formula Details */}
              <Section 
                title="Formula Information" 
                icon={<Code size={18} />} 
                iconColor="text-blue-600"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded flex justify-between">
                    <span className="text-gray-600">Total Formulas</span>
                    <span className="font-medium">{analysis?.formulaCount || 0}</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded flex justify-between">
                    <span className="text-gray-600">Has Formulas</span>
                    <span className={`font-medium ${analysis?.hasFormulas ? 'text-green-600' : 'text-gray-500'}`}>
                      {analysis?.hasFormulas ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </Section>

              {/* Formula Suggestions */}
              {(insights?.formulaSuggestions?.length > 0 || insights?.formulaTips?.length > 0) && (
                <Section 
                  title="Recommended Formulas" 
                  icon={<Code size={18} />} 
                  iconColor="text-indigo-600"
                >
                  <div className="space-y-2">
                    {(insights?.formulaSuggestions || insights?.formulaTips || []).map((formula, idx) => (
                      <div key={idx} className="p-3 bg-indigo-50 rounded-md">
                        <pre className="text-sm text-indigo-800 font-mono whitespace-pre-wrap">{formula}</pre>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Advanced Features */}
              {(insights?.advancedFeatures?.length > 0) && (
                <Section 
                  title="Advanced Excel Features" 
                  icon={<Sparkles size={18} />} 
                  iconColor="text-purple-600"
                >
                  <ul className="space-y-2">
                    {insights.advancedFeatures.map((feature, idx) => (
                      <li key={idx} className="flex">
                        <div className="text-purple-500 mr-3 mt-0.5">•</div>
                        <div className="text-gray-700">{feature}</div>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}

          {/* Visualizations Tab */}
          {activeTab === 'visualize' && (
            <div className="space-y-4">
              {/* Visualization Ideas */}
              {(insights?.visualizationIdeas?.length > 0 || insights?.visualizations?.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(insights?.visualizationIdeas || insights?.visualizations || []).map((idea, idx) => (
                    <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <PieChart size={18} className="text-indigo-500 mr-2" />
                        <h3 className="text-base font-medium text-gray-800">Chart Suggestion {idx + 1}</h3>
                      </div>
                      <p className="text-gray-700">{idea}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <PieChart size={40} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-1">No Visualization Suggestions</h3>
                  <p className="text-gray-500">This file doesn't have specific visualization recommendations.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="flex items-center">
                <Bot size={12} className="text-purple-500 mr-1" />
                Analysis powered by AI
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelAnalysisViewer;