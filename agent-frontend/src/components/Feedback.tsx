import React from 'react';
import { Button } from './ui/button';

export const FeedBack: React.FC<{
  feedback: string;
  setFeedback: React.Dispatch<React.SetStateAction<string>>;
  setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
  addFeedback: (id: string, feedback: string) => Promise<void>;
  messageId: string;
}> = ({ feedback, setFeedback, setShowFeedback, addFeedback, messageId }) => {
  function closeFeedbackPopup() {
    setShowFeedback(false);
    setFeedback('');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeFeedbackPopup();
        }
      }}
    >
      <div className="bg-secondary p-6 rounded-xl w-full max-w-lg shadow-xl ">
        <h2 className="text-lg font-semibold mb-4">We'd love your feedback</h2>
        <textarea
          id="message"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback"
          className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2"
        />
        <div className="flex justify-end mt-4 gap-2">
          <Button variant={'outline'} onClick={closeFeedbackPopup}>
            Cancel
          </Button>
          <Button onClick={() => addFeedback(messageId, feedback)}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
