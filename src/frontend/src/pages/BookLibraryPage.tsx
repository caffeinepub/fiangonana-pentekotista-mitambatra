import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListBooks, useCreateBook, useDeleteBook } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Trash2, Edit, Library } from 'lucide-react';
import { toast } from 'sonner';
import type { Book } from '../backend';

export default function BookLibraryPage() {
  const navigate = useNavigate();
  const { data: books = [], isLoading } = useListBooks();
  const createBook = useCreateBook();
  const deleteBook = useDeleteBook();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookType, setNewBookType] = useState<'Book' | 'Lesson'>('Lesson');
  const [newBookLevel, setNewBookLevel] = useState('A1');
  const [newBookTopic, setNewBookTopic] = useState('');

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || 'Unknown',
      type: newBookType,
      topic: newBookTopic.trim() || undefined,
      level: newBookLevel,
      sentences: [],
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };

    try {
      await createBook.mutateAsync(newBook);
      toast.success('Book created successfully');
      setCreateDialogOpen(false);
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookTopic('');
    } catch (error) {
      toast.error('Failed to create book');
      console.error(error);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) return;

    try {
      await deleteBook.mutateAsync(bookId);
      toast.success('Book deleted successfully');
    } catch (error) {
      toast.error('Failed to delete book');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section with Cover Image */}
      <div className="relative mb-8 rounded-xl overflow-hidden">
        <img
          src="/assets/generated/book-cover.dim_1200x1600.png"
          alt="Chinese Book Reader"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end">
          <div className="p-6 w-full">
            <div className="flex items-center gap-3 mb-2">
              <Library className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Chinese Book Reader</h1>
            </div>
            <p className="text-muted-foreground">Learn Chinese with interactive reading and text-to-speech</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Library</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Book</DialogTitle>
              <DialogDescription>Add a new book or lesson to your library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Enter book title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  placeholder="Enter author name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newBookType} onValueChange={(value: 'Book' | 'Lesson') => setNewBookType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Lesson">Lesson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={newBookLevel} onValueChange={setNewBookLevel}>
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 - Beginner</SelectItem>
                    <SelectItem value="A2">A2 - Elementary</SelectItem>
                    <SelectItem value="B1">B1 - Intermediate</SelectItem>
                    <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                    <SelectItem value="C1">C1 - Advanced</SelectItem>
                    <SelectItem value="C2">C2 - Proficient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  value={newBookTopic}
                  onChange={(e) => setNewBookTopic(e.target.value)}
                  placeholder="e.g., THEO, REL, CULTURE, ST, GAME, 101"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBook} disabled={createBook.isPending}>
                {createBook.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No books yet</h3>
          <p className="text-muted-foreground mb-4">Create your first book to get started</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Book
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{book.title}</CardTitle>
                    <CardDescription className="truncate">{book.author}</CardDescription>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{book.type}</span>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                      {book.level}
                    </span>
                    {book.topic && (
                      <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                        {book.topic}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {book.sentences.length} sentence{book.sentences.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate({ to: '/books/$bookId/read', params: { bookId: book.id } })}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: '/books/$bookId/edit', params: { bookId: book.id } })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      disabled={deleteBook.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
