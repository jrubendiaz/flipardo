import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const PRICE = {
    LOW: 9900,
    MID: 99999,
    HIGH: 299999
  }
  const { register, watch, reset } = useForm();

  const onValueChange = () => {
    if(watch("price") && /^[0-9,.]*$/.test(watch("price"))) {
      const number = getNumberFromString(watch("price"))
      if(number >= 1000) {
        reset({
          price: formatNumber(number)
        })
      } else {
        reset({
          price: formatNumber(number)
        })
        return
      }
  
      if(number < 1000) {
        setBuyNowPrice(0)
        return
      }
      if(number < PRICE.MID && number > PRICE.LOW) setBuyNowPrice(parseInt(number) + ((Math.floor(parseInt(number) / 10000) + 3) * 1000))
      if(number < PRICE.LOW) setBuyNowPrice(parseInt(number) + ((Math.floor(parseInt(number) / 1000) + 3) * 100))
      if(number > PRICE.MID) setBuyNowPrice(parseInt(number) + ((Math.floor(parseInt(number) / 10000) + 3) * 1000))
    } else {
      reset({
        price: 0
      })
    }
  }
  const [buyNowPrice, setBuyNowPrice] = useState(null)
  const getMargin = () => Math.round((buyNowPrice * 0.95) - getNumberFromString(watch("price")))
  const getNumberFromString = (string) => string && parseFloat(string.replace(/,/g, ''))
  const formatNumber = (number) => number > 0 && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const canShowNumber = watch("price") && /^[0-9,.]*$/.test(watch("price")) && getNumberFromString(watch("price")) > 999

  return (
    <div className="App">
      <form className='p-4'>
        <div className='flex flex-col pt-12 p-24'>
        <label htmlFor="price">Compraste por:</label>
        <input 
          type="text" 
          {...register("price", { required: true, onChange: onValueChange })} 
          className="rounded-md rounded bg-slate-300 p-2 text-2xl text-center"
          defaultValue="1000"
        />
        </div>
      </form>

      { (canShowNumber && 
        <div>
          Vende a <b>{formatNumber(buyNowPrice)}</b>. Obtendrás un beneficio de <b>{formatNumber(getMargin())}</b> por carta
        </div>) ||
        <div> Para obtener beneficios te recomendamos hacer tus flips con cartas de al menos <b>10,000</b> monedas </div>
      }
    </div>
  );
}

export default App;
