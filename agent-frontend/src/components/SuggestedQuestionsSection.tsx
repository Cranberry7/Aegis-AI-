import { Button } from '@/components/ui/button';

interface SuggestedQuestionsSectionProps {
  suggestedQuestions: string[] | null;
  askSuggestedQuestion?: (question: string) => void;
}

export const SuggestedQuestionsSection: React.FC<
  SuggestedQuestionsSectionProps
> = ({ suggestedQuestions, askSuggestedQuestion }) => {
  return (
    <div className="p-4 rounded-2xl w-full">
      <div className="flex flex-wrap gap-4 overflow-hidden w-full justify-start">
        {suggestedQuestions?.map((question: string, index: number) => (
          <Button
            key={index}
            variant="outline"
            className="text-left text-sm flex-wrap max-w-full whitespace-normal break-words rounded-2xl bg-accent shadow-lg h-fit"
            onClick={() => askSuggestedQuestion?.(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};
