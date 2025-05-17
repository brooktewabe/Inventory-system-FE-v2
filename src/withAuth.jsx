/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Spinner from './Components/Spinner';
import { Cookies } from "react-cookie";

const withAuth = (WrappedComponent) => {
    const HocComponent = (props) => {
      const navigate = useNavigate();
      // eslint-disable-next-line no-unused-vars
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [redirecting, setRedirecting] = useState(false);
      const cookies = new Cookies(); 

      useEffect(() => {
        const checkAuth = async () => {
            const jwtToken = cookies.get('jwt');
            if (!jwtToken) {
                setRedirecting(true);
                navigate('/login');
            } else {
                setLoading(false);
                setUser(true);
            }
        };
        
        checkAuth();
      }, [navigate, cookies]);


      if (loading || redirecting) {
        return <div><Spinner /></div>;
      }
  
      return <WrappedComponent {...props} />;
    };
  
    return HocComponent;
};

export default withAuth;