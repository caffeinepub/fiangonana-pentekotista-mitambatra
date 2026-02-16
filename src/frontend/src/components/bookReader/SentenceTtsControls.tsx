import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface SentenceTtsControlsProps {
  text: string;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  autoplay: boolean;
  onAutoplayChange: (value: boolean) => void;
  showGlobalControls?: boolean;
}

export function SentenceTtsControls({
  text,
  isPlaying,
  onPlay,
  onStop,
  autoplay,
  onAutoplayChange,
  showGlobalControls = false,
}: SentenceTtsControlsProps) {
  const { isSupported, rate, setRate, pitch, setPitch } = useSpeechSynthesis();

  if (!isSupported) {
    return (
      <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Volume2 className="h-5 w-5" />
          <p className="text-sm">
            Text-to-speech is not supported in your browser. Please try Chrome, Edge, or Safari.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={isPlaying ? onStop : onPlay}
          variant={isPlaying ? 'destructive' : 'default'}
          size="sm"
          disabled={!text}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          )}
        </Button>

        {showGlobalControls && (
          <div className="flex items-center gap-2">
            <Switch id="autoplay" checked={autoplay} onCheckedChange={onAutoplayChange} />
            <Label htmlFor="autoplay" className="cursor-pointer">
              Autoplay Next
            </Label>
          </div>
        )}
      </div>

      {showGlobalControls && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Speed: {rate.toFixed(1)}x</Label>
            <Slider
              value={[rate]}
              onValueChange={([value]) => setRate(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Pitch: {pitch.toFixed(1)}</Label>
            <Slider
              value={[pitch]}
              onValueChange={([value]) => setPitch(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
