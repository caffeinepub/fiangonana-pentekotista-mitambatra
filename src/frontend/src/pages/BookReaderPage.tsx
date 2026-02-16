import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBook } from '../hooks/useQueries';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SentenceTtsControls } from '../components/bookReader/SentenceTtsControls';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function BookReaderPage() {
  const { bookId } = useParams({ from: '/books/$bookId/read' });
  const navigate = useNavigate();
  const { data: book, isLoading } = useGetBook(bookId);
  const { speak, stop, isSpeaking, isSupported, rate, pitch } = useSpeechSynthesis();

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    // Stop speech when component unmounts
    return () => {
      stop();
    };
  }, [stop]);

  const handlePlaySentence = (index: number, text: string) => {
    if (currentSentenceIndex === index && isSpeaking) {
      stop();
      setCurrentSentenceIndex(null);
    } else {
      setCurrentSentenceIndex(index);
      speak(text, {
        lang: 'zh-CN',
        rate,
        pitch,
        onEnd: () => {
          setCurrentSentenceIndex(null);
          if (autoplay && book && index < book.sentences.length - 1) {
            // Auto-play next sentence
            setTimeout(() => {
              const nextIndex = index + 1;
              setCurrentSentenceIndex(nextIndex);
              speak(book.sentences[nextIndex].chinese, {
                lang: 'zh-CN',
                rate,
                pitch,
                onEnd: () => {
                  setCurrentSentenceIndex(null);
                  if (autoplay && nextIndex < book.sentences.length - 1) {
                    handlePlaySentence(nextIndex + 1, book.sentences[nextIndex + 1].chinese);
                  }
                },
              });
            }, 500);
          }
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Book not found</h3>
          <p className="text-muted-foreground mb-4">The book you're looking for doesn't exist</p>
          <Button onClick={() => navigate({ to: '/books' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl reading-theme">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/books' })} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-muted-foreground">by {book.author}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{book.type}</span>
              <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                {book.level}
              </span>
              {book.topic && (
                <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">{book.topic}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Playback Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <SentenceTtsControls
            text=""
            isPlaying={false}
            onPlay={() => {}}
            onStop={() => {}}
            autoplay={autoplay}
            onAutoplayChange={setAutoplay}
            showGlobalControls={true}
          />
        </CardContent>
      </Card>

      {/* Sentences */}
      {book.sentences.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No sentences yet. Add some in the editor.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {book.sentences.map((sentence, index) => (
            <Card key={sentence.id} className={`transition-all ${currentSentenceIndex === index ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Chinese Text */}
                  <div>
                    <p className="text-2xl font-medium leading-relaxed mb-2">{sentence.chinese}</p>
                    <p className="text-sm text-muted-foreground italic">{sentence.pinyin}</p>
                  </div>

                  <Separator />

                  {/* English Translation */}
                  <div>
                    <p className="text-base text-foreground/80">{sentence.english}</p>
                  </div>

                  {/* Grammar Hints */}
                  {sentence.grammaticHints && (
                    <>
                      <Separator />
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Grammar:</span> {sentence.grammaticHints}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Play Button */}
                  <div className="pt-2">
                    <SentenceTtsControls
                      text={sentence.chinese}
                      isPlaying={currentSentenceIndex === index && isSpeaking}
                      onPlay={() => handlePlaySentence(index, sentence.chinese)}
                      onStop={stop}
                      autoplay={autoplay}
                      onAutoplayChange={setAutoplay}
                      showGlobalControls={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
