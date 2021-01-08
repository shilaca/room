import Link from 'next/link'
import { FC } from 'react'
import Layout from '../components/Layout'
import Room from '../components/room'

const IndexPage: FC = () => {
  return (
    <div id="main">
      index page
      <Room></Room>
    </div>
    // <Layout title="Home | Next.js + TypeScript Example">
    //   <h1>Hello Next.js 👋</h1>
    //   <p>
    //     <Link href="/about">
    //       <a>About</a>
    //     </Link>
    //   </p>
    // </Layout>
  )
}

export default IndexPage
