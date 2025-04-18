import React, { Suspense } from 'react';
import Header from '../components/Header';
import CoinInfo from '../components/CoinInfo';

const page = () => {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <CoinInfo />
      </Suspense>
    </div>
  );
};

export default page;
