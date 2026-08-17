import { About } from '../components/About'
import { aboutContent } from './about-content'

export default function AboutPage() {
  return (
    <>
      <About data={aboutContent} />
    </>
  )
}
