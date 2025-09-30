
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { Loader } from './components/Loader';
import { DownloadIcon, SparklesIcon, ResultIcon } from './components/Icons';
import { generateStyledImage } from './services/geminiService';
import { Status } from './types';

const App: React.FC = () => {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [extraCommands, setExtraCommands] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    if (!mainImage || !referenceImage) {
      setError('Please upload both a main and a reference image.');
      return;
    }

    setStatus(Status.LOADING);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateStyledImage(mainImage, referenceImage, extraCommands);
      if (result) {
        setGeneratedImage(`data:image/png;base64,${result}`);
        setStatus(Status.SUCCESS);
      } else {
        throw new Error('The AI model did not return an image. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus(Status.ERROR);
    }
  }, [mainImage, referenceImage, extraCommands]);

  const canGenerate = mainImage && referenceImage && status !== Status.LOADING;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-4xl bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 overflow-hidden">
        <div className="p-6 sm:p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              AI Image Style Transfer
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
              Upload a main image and a style reference, and let AI blend them into a new creation.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ImageUploader title="Main Image" onFileSelect={setMainImage} />
            <ImageUploader title="Reference Image" onFileSelect={setReferenceImage} />
          </div>

          <div className="mb-8">
            <label htmlFor="commands" className="block text-sm font-medium text-slate-700 mb-2">
              Optional Commands
            </label>
            <input
              id="commands"
              type="text"
              value={extraCommands}
              onChange={(e) => setExtraCommands(e.target.value)}
              placeholder="e.g., make background white, add soft shadows"
              className="w-full px-4 py-2 text-slate-700 bg-white/70 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            />
          </div>

          <div className="flex justify-center mb-8">
            <Button onClick={handleGenerateClick} disabled={!canGenerate}>
              <SparklesIcon />
              {status === Status.LOADING ? 'Generating...' : 'Generate Image'}
            </Button>
          </div>

          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg mb-6">{error}</p>}
          
          <div className="bg-slate-100/50 rounded-lg p-6 min-h-[20rem] flex flex-col items-center justify-center">
            {status === Status.LOADING && <Loader />}
            {status === Status.IDLE && (
               <div className="text-center text-slate-500">
                  <ResultIcon />
                  <p className="mt-2 font-medium">Your generated image will appear here</p>
               </div>
            )}
            {status === Status.SUCCESS && generatedImage && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <img
                  src={generatedImage}
                  alt="AI Generated"
                  className="rounded-lg shadow-md max-w-full max-h-96 object-contain"
                />
                <a
                  href={generatedImage}
                  download="ai-styled-image.png"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-yellow-900 font-semibold rounded-lg shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-transform transform hover:scale-105"
                >
                  <DownloadIcon />
                  Download Image
                </a>
              </div>
            )}
            {status === Status.ERROR && !error && (
                <div className="text-center text-red-500">
                    <p>Something went wrong. Please check the console for details.</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
