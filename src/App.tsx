import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Upload, Play, Download, Github } from 'lucide-react';

export default function AutoencoderDemoWeb() {
  const [step, setStep] = useState('landing');
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [rowsPreview, setRowsPreview] = useState<string[][]>([]);
  const [nFeatures, setNFeatures] = useState(0);
  const [trainProgress, setTrainProgress] = useState(0);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [maeData, setMaeData] = useState<any[]>([]);
  const [confMatrix, setConfMatrix] = useState([[0, 0], [0, 0]]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'train') {
      setTrainProgress(0);
      setHistoryData([]);
      let epoch = 0;
      timer = setInterval(() => {
        epoch += 1;
        setTrainProgress(prev => Math.min(100, prev + 10));
        setHistoryData(h => [...h, { epoch, train: Math.max(0.02, 0.5 / epoch), val: Math.max(0.03, 0.6 / epoch) }]);
        if (epoch === 10) {
          setStep('results');
          const normal = Array.from({ length: 200 }, (_, i) => ({ x: i, mae: Math.abs(Math.random() * 0.02 + 0.02) }));
          const anomaly = Array.from({ length: 40 }, (_, i) => ({ x: 200 + i, mae: Math.abs(Math.random() * 0.05 + 0.06) }));
          setMaeData([...normal.slice(0, 40), ...anomaly.slice(0, 40)].map((d, i) => ({ index: i, mae: d.mae, type: i < 40 ? 'normal' : 'anomaly' })));
          setConfMatrix([[180, 20], [15, 25]]);
          clearInterval(timer);
        }
      }, 600);
    }
    return () => clearInterval(timer);
  }, [step]);

  function handleFileOpen() {
    fileInputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const header = lines[0].split(',').map(h => h.trim());
    const preview = lines.slice(1, 6).map(l => l.split(',').map(v => v.trim()));
    setRowsPreview([header, ...preview]);
    setCsvLoaded(true);
    setNFeatures(header.length - 1);
    setStep('preprocess');
  }

  function downloadSampleCSV() {
    const sample = `duration,protocol_type,service,flag,src_bytes,dst_bytes,class\n0,tcp,http,SF,181,5450,normal\n0,tcp,http,SF,239,486,normal\n0,udp,domain_u,SF,105,146,anomaly`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample.csv';
    a.click();
  }

  function startTraining() {
    setStep('train');
  }

  const navItems = [
    { label: 'Home', value: 'landing' },
    { label: 'Upload', value: 'upload' },
    { label: 'Results', value: 'results' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white bg-opacity-5 backdrop-blur-md border-b border-white border-opacity-10 sticky top-0 z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AE</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Autoencoder Anomaly Detector</h1>
                <p className="text-xs text-slate-400">Network Intrusion Detection System</p>
              </div>
            </div>

            <nav className="flex gap-2">
              {navItems.map(item => (
                <button
                  key={item.value}
                  onClick={() => setStep(item.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${step === item.value ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white hover:bg-opacity-5'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="px-6 py-8">
          {step === 'landing' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-3">1D-CNN Autoencoder</h2>
                    <p className="text-xl text-slate-400">Network Anomaly Detection Demo</p>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    This interactive demonstration showcases how a 1D-CNN autoencoder can detect network intrusions by learning patterns from normal traffic. Anomalies are identified through reconstruction error analysis.
                  </p>

                  <ul className="space-y-3">
                    {[
                      'Train exclusively on normal network traffic patterns',
                      'Use 1D Convolutional Neural Networks for feature extraction',
                      'Detect anomalies via reconstruction error thresholding',
                      'Visualize loss curves, MAE distributions, and model performance'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <span className="w-6 h-6 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-400 text-sm flex-shrink-0 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setStep('upload')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 w-fit"
                  >
                    <Upload size={20} />
                    Start Demo
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Quick Start Guide</h3>
                    <ol className="space-y-3 text-slate-300">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                        <span>Upload KDDTest+ dataset or sample CSV</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                        <span>Review preprocessed data and features</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
                        <span>Train the autoencoder model</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</span>
                        <span>Analyze results and performance metrics</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-xl p-6">
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-blue-300">Note:</span> This demo simulates training on the client-side for demonstration purposes. Production systems would use Python/TensorFlow backends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'upload' && (
            <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-8 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Upload Dataset</h2>
                <p className="text-slate-400">Upload your CSV file or download a sample to test</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleFileOpen}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Choose CSV File
                </button>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
                <button
                  onClick={downloadSampleCSV}
                  className="px-6 py-3 border border-slate-400 text-slate-300 rounded-lg font-semibold hover:bg-white hover:bg-opacity-5 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Sample
                </button>
              </div>

              {csvLoaded && (
                <div className="space-y-4">
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 rounded-lg p-4">
                    <p className="text-green-300 text-sm">Dataset loaded successfully!</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Data Preview</h3>
                    <div className="overflow-x-auto rounded-lg border border-white border-opacity-10">
                      <table className="w-full text-sm">
                        <thead className="bg-white bg-opacity-5 border-b border-white border-opacity-10">
                          <tr>
                            {rowsPreview[0].map((h, i) => (
                              <th key={i} className="px-4 py-3 text-left text-slate-300 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white divide-opacity-5">
                          {rowsPreview.slice(1).map((r, ri) => (
                            <tr key={ri} className="hover:bg-white hover:bg-opacity-5 transition-colors">
                              {r.map((c, ci) => (
                                <td key={ci} className="px-4 py-3 text-slate-300">{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-4">
                    <div>
                      <p className="text-slate-400 text-sm">Detected Features</p>
                      <p className="text-2xl font-bold text-white">{nFeatures}</p>
                    </div>
                    <button
                      onClick={() => setStep('preprocess')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Next: Preprocess
                    </button>
                  </div>
                </div>
              )}

              {!csvLoaded && (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-lg">No CSV loaded yet</p>
                  <p className="text-slate-500 text-sm mt-2">Upload a KDDTest+ dataset or use the sample to get started</p>
                </div>
              )}
            </div>
          )}

          {step === 'preprocess' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-8 space-y-4">
                <h3 className="text-2xl font-bold text-white">Data Preprocessing</h3>
                <p className="text-slate-400 text-sm">Applied transformations:</p>
                <ul className="space-y-3">
                  {[
                    'Duplicate header removal',
                    'Numeric column conversion',
                    'NaN value handling',
                    'One-hot encoding (categorical)',
                    'MinMax scaling (0-1 normalization)',
                    'Data validation checks'
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {step}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={startTraining}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 mt-6"
                >
                  <Play size={20} />
                  Start Training
                </button>
              </div>

              <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Model Architecture</h3>
                <div className="bg-black bg-opacity-40 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto space-y-1">
                  <div className="text-cyan-400">Input: (n_samples, n_features)</div>
                  <div className="text-slate-400">│</div>
                  <div className="text-slate-300">Conv1D(32, kernel=7) → ReLU</div>
                  <div className="text-slate-300">MaxPooling1D(2)</div>
                  <div className="text-slate-400">│</div>
                  <div className="text-slate-300">Conv1D(16, kernel=7) → ReLU</div>
                  <div className="text-slate-300">MaxPooling1D(2)</div>
                  <div className="text-slate-400">│ ← Bottleneck</div>
                  <div className="text-slate-300">UpSampling1D(2)</div>
                  <div className="text-slate-300">Conv1D(16, kernel=7) → ReLU</div>
                  <div className="text-slate-400">│</div>
                  <div className="text-slate-300">UpSampling1D(2)</div>
                  <div className="text-slate-300">Conv1D(1, kernel=7) → Linear</div>
                  <div className="text-slate-400">│</div>
                  <div className="text-green-400">Output: Reconstructed Input</div>
                  <div className="text-slate-400 mt-3">Loss: MAE | Optimizer: Adam</div>
                </div>
              </div>
            </div>
          )}

          {step === 'train' && (
            <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white">Training Progress</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Overall Progress</span>
                  <span className="text-xl font-bold text-cyan-400">{trainProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    style={{ width: `${trainProgress}%` }}
                    className="h-3 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  ></div>
                </div>
              </div>

              <div className="bg-black bg-opacity-20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Training Loss</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="train" stroke="#06b6d4" dot={false} strokeWidth={2} name="Training Loss" />
                    <Line type="monotone" dataKey="val" stroke="#10b981" dot={false} strokeWidth={2} name="Validation Loss" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Results & Analysis</h2>
                <p className="text-slate-400">Model performance on test dataset</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-white">MAE Distribution</h3>
                  <div className="bg-black bg-opacity-20 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={maeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="index" hide />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }} />
                        <Bar dataKey="mae" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-slate-400">
                    Reconstruction error histogram showing separation between normal and anomalous samples. A threshold is applied to classify new data.
                  </p>
                </div>

                <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-white">Confusion Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white border-opacity-10">
                          <th className="px-3 py-2 text-left text-slate-300"></th>
                          <th className="px-3 py-2 text-center text-slate-300">Predicted: Normal</th>
                          <th className="px-3 py-2 text-center text-slate-300">Predicted: Anomaly</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white divide-opacity-10">
                        <tr>
                          <td className="px-3 py-3 text-slate-300 font-semibold">True: Normal</td>
                          <td className="px-3 py-3 text-center text-white bg-green-500 bg-opacity-10 rounded">{confMatrix[0][0]}</td>
                          <td className="px-3 py-3 text-center text-white bg-red-500 bg-opacity-10 rounded">{confMatrix[0][1]}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-3 text-slate-300 font-semibold">True: Anomaly</td>
                          <td className="px-3 py-3 text-center text-white bg-red-500 bg-opacity-10 rounded">{confMatrix[1][0]}</td>
                          <td className="px-3 py-3 text-center text-white bg-green-500 bg-opacity-10 rounded">{confMatrix[1][1]}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-black bg-opacity-20 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Precision (Anomaly)</span>
                      <span className="text-cyan-400 font-semibold">{((confMatrix[1][1] / Math.max(1, confMatrix[0][1] + confMatrix[1][1])) || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recall (Anomaly)</span>
                      <span className="text-cyan-400 font-semibold">{((confMatrix[1][1] / Math.max(1, confMatrix[1][0] + confMatrix[1][1])) || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accuracy</span>
                      <span className="text-cyan-400 font-semibold">{(((confMatrix[0][0] + confMatrix[1][1]) / (confMatrix[0][0] + confMatrix[0][1] + confMatrix[1][0] + confMatrix[1][1])) || 0).toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-5 backdrop-blur border border-white border-opacity-10 rounded-xl p-8 space-y-4">
                <h3 className="text-xl font-semibold text-white">Implementation Notes</h3>
                <div className="space-y-3 text-slate-300 text-sm">
                  <p>
                    <span className="font-semibold text-cyan-400">Architecture:</span> This 1D-CNN autoencoder uses convolutional layers for hierarchical feature extraction, with a bottleneck design to force dimensionality reduction and improve anomaly detection sensitivity.
                  </p>
                  <p>
                    <span className="font-semibold text-cyan-400">Training:</span> The model is trained exclusively on normal traffic patterns using Mean Absolute Error (MAE) loss. This allows it to learn what "normal" looks like.
                  </p>
                  <p>
                    <span className="font-semibold text-cyan-400">Detection:</span> Anomalies are identified when reconstruction error exceeds a threshold. The threshold is typically set using percentiles of the training error distribution.
                  </p>
                  <p>
                    <span className="font-semibold text-cyan-400">Production Deployment:</span> The frontend simulation uses client-side computation. Real systems use Python/TensorFlow backends with REST APIs for model training and inference.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => alert('Ready for backend integration')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Export Results
                </button>
                <button
                  onClick={() => setStep('landing')}
                  className="px-6 py-3 border border-slate-400 text-slate-300 rounded-lg font-semibold hover:bg-white hover:bg-opacity-5 transition-all flex items-center justify-center gap-2"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-white border-opacity-10 bg-white bg-opacity-5 backdrop-blur mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 text-sm space-y-2">
            <p>1D-CNN Autoencoder for Network Anomaly Detection</p>
            <p>Educational Demo | Adaptable for Production Use with Backend Integration</p>
            <p className="text-xs text-slate-500">Built with React, TypeScript, Tailwind CSS, and Recharts</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
