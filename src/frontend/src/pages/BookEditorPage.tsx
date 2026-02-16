import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  useGetBook,
  useUpdateBook,
  useAddSentenceToBook,
  useUpdateSentenceInBook,
  useDeleteSentenceFromBook,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { Book, Sentence } from '../backend';

export default function BookEditorPage() {
  const { bookId } = useParams({ from: '/books/$bookId/edit' });
  const navigate = useNavigate();
  const { data: book, isLoading } = useGetBook(bookId);
  const updateBook = useUpdateBook();
  const addSentence = useAddSentenceToBook();
  const updateSentence = useUpdateSentenceInBook();
  const deleteSentence = useDeleteSentenceFromBook();

  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [sentenceDialogOpen, setSentenceDialogOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [sentenceChinese, setSentenceChinese] = useState('');
  const [sentenceEnglish, setSentenceEnglish] = useState('');
  const [sentencePinyin, setSentencePinyin] = useState('');
  const [sentenceGrammar, setSentenceGrammar] = useState('');

  useEffect(() => {
    if (book) {
      setBookTitle(book.title);
      setBookAuthor(book.author);
    }
  }, [book]);

  const handleSaveBookInfo = async () => {
    if (!book || !bookTitle.trim()) {
      toast.error('Book title is required');
      return;
    }

    const updatedBook: Book = {
      ...book,
      title: bookTitle.trim(),
      author: bookAuthor.trim() || 'Unknown',
      updatedAt: BigInt(Date.now()),
    };

    try {
      await updateBook.mutateAsync(updatedBook);
      toast.success('Book info updated');
    } catch (error) {
      toast.error('Failed to update book info');
      console.error(error);
    }
  };

  const handleOpenSentenceDialog = (sentence?: Sentence) => {
    if (sentence) {
      setEditingSentence(sentence);
      setSentenceChinese(sentence.chinese);
      setSentenceEnglish(sentence.english);
      setSentencePinyin(sentence.pinyin);
      setSentenceGrammar(sentence.grammaticHints || '');
    } else {
      setEditingSentence(null);
      setSentenceChinese('');
      setSentenceEnglish('');
      setSentencePinyin('');
      setSentenceGrammar('');
    }
    setSentenceDialogOpen(true);
  };

  const handleSaveSentence = async () => {
    if (!book || !sentenceChinese.trim()) {
      toast.error('Chinese text is required');
      return;
    }

    const sentenceData: Sentence = {
      id: editingSentence?.id || `sentence-${Date.now()}`,
      chinese: sentenceChinese.trim(),
      english: sentenceEnglish.trim(),
      pinyin: sentencePinyin.trim(),
      grammaticHints: sentenceGrammar.trim() || undefined,
      createdAt: editingSentence?.createdAt || BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };

    try {
      if (editingSentence) {
        await updateSentence.mutateAsync({ bookId: book.id, sentence: sentenceData });
        toast.success('Sentence updated');
      } else {
        await addSentence.mutateAsync({ bookId: book.id, sentence: sentenceData });
        toast.success('Sentence added');
      }
      setSentenceDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save sentence');
      console.error(error);
    }
  };

  const handleDeleteSentence = async (sentenceId: string) => {
    if (!book || !confirm('Are you sure you want to delete this sentence?')) return;

    try {
      await deleteSentence.mutateAsync({ bookId: book.id, sentenceId });
      toast.success('Sentence deleted');
    } catch (error) {
      toast.error('Failed to delete sentence');
      console.error(error);
    }
  };

  const handleReorderSentences = async (fromIndex: number, toIndex: number) => {
    if (!book) return;

    const reorderedSentences = [...book.sentences];
    const [movedSentence] = reorderedSentences.splice(fromIndex, 1);
    reorderedSentences.splice(toIndex, 0, movedSentence);

    const updatedBook: Book = {
      ...book,
      sentences: reorderedSentences,
      updatedAt: BigInt(Date.now()),
    };

    try {
      await updateBook.mutateAsync(updatedBook);
      toast.success('Sentences reordered');
    } catch (error) {
      toast.error('Failed to reorder sentences');
      console.error(error);
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
          <h3 className="text-xl font-semibold mb-2">Book not found</h3>
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
        <h1 className="text-3xl font-bold">Edit Book</h1>
      </div>

      {/* Book Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} />
          </div>
          <Button onClick={handleSaveBookInfo} disabled={updateBook.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateBook.isPending ? 'Saving...' : 'Save Book Info'}
          </Button>
        </CardContent>
      </Card>

      {/* Sentences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sentences ({book.sentences.length})</CardTitle>
            <Button onClick={() => handleOpenSentenceDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sentence
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {book.sentences.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No sentences yet. Add your first sentence.</p>
          ) : (
            <div className="space-y-3">
              {book.sentences.map((sentence, index) => (
                <Card key={sentence.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg mb-1">{sentence.chinese}</p>
                      <p className="text-sm text-muted-foreground mb-1">{sentence.pinyin}</p>
                      <p className="text-sm">{sentence.english}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleOpenSentenceDialog(sentence)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSentence(sentence.id)}
                        disabled={deleteSentence.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sentence Dialog */}
      <Dialog open={sentenceDialogOpen} onOpenChange={setSentenceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSentence ? 'Edit Sentence' : 'Add New Sentence'}</DialogTitle>
            <DialogDescription>Fill in the sentence details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chinese">Chinese Text *</Label>
              <Textarea
                id="chinese"
                value={sentenceChinese}
                onChange={(e) => setSentenceChinese(e.target.value)}
                placeholder="输入中文句子"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pinyin">Pinyin</Label>
              <Input
                id="pinyin"
                value={sentencePinyin}
                onChange={(e) => setSentencePinyin(e.target.value)}
                placeholder="shūrù pīnyīn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="english">English Translation</Label>
              <Textarea
                id="english"
                value={sentenceEnglish}
                onChange={(e) => setSentenceEnglish(e.target.value)}
                placeholder="Enter English translation"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grammar">Grammar Hints (Optional)</Label>
              <Textarea
                id="grammar"
                value={sentenceGrammar}
                onChange={(e) => setSentenceGrammar(e.target.value)}
                placeholder="Add grammar notes or hints"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSentenceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSentence}
              disabled={addSentence.isPending || updateSentence.isPending}
            >
              {addSentence.isPending || updateSentence.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
