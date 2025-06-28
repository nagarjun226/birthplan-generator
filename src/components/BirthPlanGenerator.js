import React, { useState, useRef, useEffect } from 'react';
import { Send, Printer, RefreshCw, AlertCircle, Key, Settings, X } from 'lucide-react';
import { AIResponseHandler } from '../utils/aiResponses';

const BirthPlanGenerator = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm here to help you create a comprehensive birth plan for your upcoming delivery. This plan will help communicate all your preferences to your healthcare team. Let's start with some basic information - what are your names?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [birthPlan, setBirthPlan] = useState(null);
  const [showPrintable, setShowPrintable] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [showApiKeyForm, setShowApiKeyForm] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const [aiHandler, setAiHandler] = useState(null);

  // Check for saved API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('openai_model') || 'gpt-4';
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeyInput(savedApiKey);
      setSelectedModel(savedModel);
      setShowApiKeyForm(false);
      initializeAI(savedApiKey, savedModel);
    }
  }, []);

  const initializeAI = (key, model) => {
    try {
      const handler = new AIResponseHandler(key);
      handler.model = model;
      setAiHandler(handler);
    } catch (error) {
      console.error('Failed to initialize AI:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleApiKeySubmit = () => {
    if (!apiKeyInput.trim() || !apiKeyInput.startsWith('sk-')) {
      alert('Please enter a valid OpenAI API key (it should start with "sk-")');
      return;
    }

    setApiKey(apiKeyInput);
    localStorage.setItem('openai_api_key', apiKeyInput);
    localStorage.setItem('openai_model', selectedModel);
    initializeAI(apiKeyInput, selectedModel);
    setShowApiKeyForm(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !aiHandler) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiHandler.processMessage(updatedMessages);

      if (response.action === 'GENERATE_PLAN') {
        setMessages([...updatedMessages, { role: 'assistant', content: response.message }]);
        
        // Generate the birth plan
        const plan = await aiHandler.generateBirthPlan(updatedMessages);
        setBirthPlan(plan);
        setShowPrintable(true);
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: response.message }]);
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = "I apologize, but I encountered an error. ";
      
      if (error.message?.includes('401')) {
        errorMessage += "Your API key seems to be invalid. Please check your API key in settings.";
      } else if (error.message?.includes('429')) {
        errorMessage += "Rate limit exceeded. Please wait a moment before trying again.";
      } else if (error.message?.includes('insufficient_quota')) {
        errorMessage += "Your OpenAI account has insufficient quota. Please check your billing settings.";
      } else {
        errorMessage += "Please try again or check your internet connection.";
      }
      
      setMessages([...updatedMessages, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const startOver = () => {
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm here to help you create a comprehensive birth plan for your upcoming delivery. This plan will help communicate all your preferences to your healthcare team. Let's start with some basic information - what are your names?"
    }]);
    setBirthPlan(null);
    setShowPrintable(false);
  };

  const updateApiKey = () => {
    if (!apiKeyInput.trim() || !apiKeyInput.startsWith('sk-')) {
      alert('Please enter a valid OpenAI API key (it should start with "sk-")');
      return;
    }

    setApiKey(apiKeyInput);
    localStorage.setItem('openai_api_key', apiKeyInput);
    localStorage.setItem('openai_model', selectedModel);
    initializeAI(apiKeyInput, selectedModel);
    setShowSettings(false);
  };

  // Show API key input form
  if (showApiKeyForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">AI-Powered Birth Plan Generator</h1>
          </div>
          
          <p className="mb-6 text-gray-700">
            Welcome! This tool uses OpenAI's advanced AI to help you create a personalized birth plan through natural conversation.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                placeholder="sk-..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI's website</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4">GPT-4 (Best quality, ~$0.10-0.30 per conversation)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster & cheaper, ~$0.01-0.03)</option>
              </select>
            </div>

            <button
              onClick={handleApiKeySubmit}
              disabled={!apiKeyInput.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Start Creating My Birth Plan
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Start Guide:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Sign up for a free OpenAI account (includes $5 credit)</li>
              <li>Create an API key in your account settings</li>
              <li>Paste your key above and choose your preferred model</li>
              <li>Start chatting naturally about your birth preferences!</li>
            </ol>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Your API key is stored locally and only used to communicate with OpenAI.
          </div>
        </div>
      </div>
    );
  }

  if (showPrintable && birthPlan) {
    return (
      <>
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            .birth-plan-document {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            @page {
              margin: 0.5in;
            }
          }
        `}</style>
        <div className="max-w-4xl mx-auto p-6">
          <div className="no-print mb-4 flex gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Click to print your birth plan (or use Ctrl+P / Cmd+P)"
            >
              <Printer className="w-4 h-4" />
              Print Birth Plan
            </button>
            <button
              onClick={startOver}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          </div>

          <div className="birth-plan-document bg-white p-8 shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-8">Birth Plan</h1>
            
            {/* Personal Information */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Parents:</strong> {birthPlan.personalInfo?.parentNames}</p>
                <p><strong>Due Date:</strong> {birthPlan.personalInfo?.dueDate}</p>
                <p><strong>Healthcare Provider:</strong> {birthPlan.personalInfo?.provider}</p>
                <p><strong>Birth Location:</strong> {birthPlan.personalInfo?.hospital}</p>
                <p><strong>Emergency Contacts:</strong> {birthPlan.personalInfo?.emergencyContacts}</p>
                <p><strong>Blood Type:</strong> {birthPlan.personalInfo?.bloodType}</p>
              </div>
              {birthPlan.personalInfo?.medicalHistory && (
                <p className="mt-2"><strong>Medical History/Allergies:</strong> {birthPlan.personalInfo.medicalHistory}</p>
              )}
            </section>

            {/* Support Team */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Support Team & Communication</h3>
              <p><strong>Support People:</strong> {birthPlan.supportTeam?.supportPeople}</p>
              {birthPlan.supportTeam?.doula && <p><strong>Doula:</strong> {birthPlan.supportTeam.doula}</p>}
              <p><strong>Communication:</strong> {birthPlan.supportTeam?.communicationPreferences}</p>
              <p><strong>Photography:</strong> {birthPlan.supportTeam?.photography}</p>
              <p><strong>Visitors:</strong> {birthPlan.supportTeam?.visitors}</p>
              <p><strong>Student Observers:</strong> {birthPlan.supportTeam?.studentObservers}</p>
            </section>

            {/* Labor Preferences */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Labor Environment & Comfort</h3>
              <p><strong>Environment:</strong> {birthPlan.laborPreferences?.environment}</p>
              <p><strong>Atmosphere:</strong> {birthPlan.laborPreferences?.atmosphere}</p>
              <p><strong>Movement:</strong> {birthPlan.laborPreferences?.movement}</p>
              <p><strong>Positions:</strong> {birthPlan.laborPreferences?.laborPositions}</p>
              <p><strong>Hydrotherapy:</strong> {birthPlan.laborPreferences?.hydrotherapy}</p>
              <p><strong>Eating/Drinking:</strong> {birthPlan.laborPreferences?.eatingDrinking}</p>
              <p><strong>Clothing:</strong> {birthPlan.laborPreferences?.clothing}</p>
              <p><strong>Encouragement:</strong> {birthPlan.laborPreferences?.encouragement}</p>
            </section>

            {/* Pain Management */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Pain Management</h3>
              <p><strong>Preferred Methods:</strong> {birthPlan.painManagement?.preferredMethods}</p>
              <p><strong>Natural Comfort Measures:</strong> {birthPlan.painManagement?.naturalComfort}</p>
              {birthPlan.painManagement?.avoidMethods && (
                <p><strong>Methods to Avoid:</strong> {birthPlan.painManagement.avoidMethods}</p>
              )}
              <p><strong>Epidural Timing:</strong> {birthPlan.painManagement?.epiduralTiming}</p>
              <p><strong>Backup Plan:</strong> {birthPlan.painManagement?.backupPlan}</p>
            </section>

            {/* Medical Interventions */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Medical Interventions</h3>
              <p><strong>Fetal Monitoring:</strong> {birthPlan.medicalInterventions?.monitoring}</p>
              <p><strong>Cervical Exams:</strong> {birthPlan.medicalInterventions?.cervicalChecks}</p>
              <p><strong>IV/Fluids:</strong> {birthPlan.medicalInterventions?.ivFluids}</p>
              <p><strong>Labor Induction:</strong> {birthPlan.medicalInterventions?.induction}</p>
              <p><strong>Pitocin:</strong> {birthPlan.medicalInterventions?.augmentation}</p>
              <p><strong>Breaking Water:</strong> {birthPlan.medicalInterventions?.amniotomy}</p>
              <p><strong>Internal Monitoring:</strong> {birthPlan.medicalInterventions?.internalMonitoring}</p>
              <p><strong>Catheter:</strong> {birthPlan.medicalInterventions?.catheter}</p>
            </section>

            {/* Delivery Preferences */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Delivery Preferences</h3>
              <p><strong>Positions:</strong> {birthPlan.deliveryPreferences?.positions}</p>
              <p><strong>Pushing:</strong> {birthPlan.deliveryPreferences?.pushing}</p>
              <p><strong>Perineal Care:</strong> {birthPlan.deliveryPreferences?.perinealCare}</p>
              <p><strong>Assisted Delivery:</strong> {birthPlan.deliveryPreferences?.assistedDelivery}</p>
              <p><strong>Who Catches Baby:</strong> {birthPlan.deliveryPreferences?.whoCatchesBaby}</p>
              <p><strong>Who Announces Sex:</strong> {birthPlan.deliveryPreferences?.whoAnnouncesSex}</p>
              <p><strong>Mirror:</strong> {birthPlan.deliveryPreferences?.mirror}</p>
            </section>

            {/* Cord and Placenta */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Umbilical Cord & Placenta</h3>
              <p><strong>Delayed Cord Clamping:</strong> {birthPlan.cordAndPlacenta?.delayedCordClamping}</p>
              <p><strong>Who Cuts Cord:</strong> {birthPlan.cordAndPlacenta?.cordCutting}</p>
              <p><strong>Cord Blood Banking:</strong> {birthPlan.cordAndPlacenta?.cordBloodBanking}</p>
              <p><strong>Placenta:</strong> {birthPlan.cordAndPlacenta?.placenta}</p>
            </section>

            {/* Immediate Postpartum */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Immediate After Birth</h3>
              <p><strong>Skin-to-Skin:</strong> {birthPlan.immediatePostpartum?.skinToSkin}</p>
              <p><strong>First Feeding:</strong> {birthPlan.immediatePostpartum?.firstFeed}</p>
              <p><strong>Baby Exams:</strong> {birthPlan.immediatePostpartum?.babyExams}</p>
              <p><strong>Weighing Baby:</strong> {birthPlan.immediatePostpartum?.weight}</p>
              <p><strong>Family Time:</strong> {birthPlan.immediatePostpartum?.familyTime}</p>
            </section>

            {/* Newborn Procedures */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Newborn Procedures</h3>
              <p><strong>Vitamin K:</strong> {birthPlan.newbornProcedures?.vitaminK}</p>
              <p><strong>Eye Ointment:</strong> {birthPlan.newbornProcedures?.eyeOintment}</p>
              <p><strong>Hepatitis B Vaccine:</strong> {birthPlan.newbornProcedures?.hepatitisB}</p>
              <p><strong>Newborn Screening:</strong> {birthPlan.newbornProcedures?.newbornScreening}</p>
              <p><strong>Hearing Test:</strong> {birthPlan.newbornProcedures?.hearing}</p>
              <p><strong>First Bath:</strong> {birthPlan.newbornProcedures?.firstBath}</p>
              {birthPlan.newbornProcedures?.circumcision && (
                <p><strong>Circumcision:</strong> {birthPlan.newbornProcedures.circumcision}</p>
              )}
            </section>

            {/* Emergency Preferences */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Emergency Situations</h3>
              <p><strong>C-Section Preferences:</strong> {birthPlan.emergencyPreferences?.cesareanPreferences}</p>
              <p><strong>C-Section Details:</strong> {birthPlan.emergencyPreferences?.cesareanDetails}</p>
              <p><strong>NICU Preferences:</strong> {birthPlan.emergencyPreferences?.nicuPreferences}</p>
              <p><strong>Decision Maker:</strong> {birthPlan.emergencyPreferences?.decisionMaker}</p>
            </section>

            {/* Feeding Plan */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Feeding Plan</h3>
              <p><strong>Method:</strong> {birthPlan.feedingPlan?.method}</p>
              <p><strong>First Feed:</strong> {birthPlan.feedingPlan?.firstFeed}</p>
              <p><strong>Lactation Support:</strong> {birthPlan.feedingPlan?.lactationSupport}</p>
              <p><strong>Pacifiers:</strong> {birthPlan.feedingPlan?.pacifiers}</p>
              <p><strong>Bottles:</strong> {birthPlan.feedingPlan?.bottles}</p>
              <p><strong>Supplements:</strong> {birthPlan.feedingPlan?.supplements}</p>
              {birthPlan.feedingPlan?.donorMilk && (
                <p><strong>Donor Milk:</strong> {birthPlan.feedingPlan.donorMilk}</p>
              )}
            </section>

            {/* Postpartum Care */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Postpartum Care</h3>
              <p><strong>Rooming:</strong> {birthPlan.postpartumCare?.rooming}</p>
              <p><strong>Mother's Care:</strong> {birthPlan.postpartumCare?.motherCare}</p>
              {birthPlan.postpartumCare?.jaundiceProtocol && (
                <p><strong>Jaundice Protocol:</strong> {birthPlan.postpartumCare.jaundiceProtocol}</p>
              )}
            </section>

            {/* Cultural/Religious */}
            {(birthPlan.culturalReligious?.practices || birthPlan.culturalReligious?.dietary || 
              birthPlan.culturalReligious?.rituals || birthPlan.culturalReligious?.placenta) && (
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Cultural & Religious Preferences</h3>
                {birthPlan.culturalReligious.practices && (
                  <p><strong>Practices:</strong> {birthPlan.culturalReligious.practices}</p>
                )}
                {birthPlan.culturalReligious.dietary && (
                  <p><strong>Dietary:</strong> {birthPlan.culturalReligious.dietary}</p>
                )}
                {birthPlan.culturalReligious.rituals && (
                  <p><strong>Rituals:</strong> {birthPlan.culturalReligious.rituals}</p>
                )}
              </section>
            )}

            {/* Additional Notes */}
            {birthPlan.additionalNotes && (
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
                <p className="bg-gray-50 p-4 rounded">{birthPlan.additionalNotes}</p>
              </section>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">
                This birth plan represents our preferences for labor and delivery. We understand that circumstances may require flexibility, and we trust our healthcare team to make necessary medical decisions while respecting our preferences when possible.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-t-lg shadow-lg p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI-Powered Birth Plan Generator</h1>
            <p className="text-gray-600">Creating a comprehensive birth plan through conversation</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4">GPT-4 (Best quality)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster & cheaper)</option>
                </select>
              </div>

              <button
                onClick={updateApiKey}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow p-4 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg p-4 border-t">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Using {selectedModel === 'gpt-4' ? 'GPT-4' : 'GPT-3.5 Turbo'} • I'll ask you one question at a time to create your comprehensive birth plan. Take your time with each answer.
          </p>
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            disabled={isLoading || !aiHandler}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !aiHandler}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          When you're ready, just say "I'm ready to create my birth plan" or "Let's generate the plan"
        </p>
      </div>
    </div>
  );
};

export default BirthPlanGenerator;
