import PuffLoader from 'react-spinners/PuffLoader';

const override ={
  display: 'block',
  margin: '100px auto'
}

// eslint-disable-next-line react/prop-types
const  Spinner= ({loading}) => {
  return (
    <PuffLoader
    color='#000000'
    loading={ loading }
    cssOverride={override}
    size={150}
    />
  )
}

export default Spinner;