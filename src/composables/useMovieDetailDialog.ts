import { ref } from 'vue'

interface MovieData {
  title: string
  rating: string
  quote: string
  poster: string
  fallbackGradient: string
  genre: string
  year: string
  country: string
  director: string
  summary: string
}

const visible = ref(false)
const currentMovie = ref<MovieData | null>(null)

export function useMovieDetailDialog() {
  function openDialog(movie: MovieData) {
    currentMovie.value = movie
    visible.value = true
  }

  function closeDialog() {
    visible.value = false
  }

  return {
    visible,
    currentMovie,
    openDialog,
    closeDialog
  }
}
