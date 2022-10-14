import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const PLAYER_PRICES_ID = {
  DEMBELE: '231443',
  MENDY: '228618',
  HAALAND: '239085'
}

function App() {
  const [buyNowPrice, setBuyNowPrice] = useState(null)
  const [playerPrices, setPlayerPrices] = useState({})
  const [selectedPlayer, setSelectedPlayer] = useState(PLAYER_PRICES_ID.HAALAND)
  const [playerPriceFF, setPlayerPriceFF] = useState(false)

  useEffect(() => {
    const refreshDate = JSON.parse(localStorage.getItem('refreshDate'))
    console.log({refreshDate})
    if (refreshDate && ((Date.now() - refreshDate) > 600000)) {
      // TODO: Only get data each 5 minutes
      Object.keys(PLAYER_PRICES_ID).forEach(playerID => {
        try {
          fetch(`https://www.futbin.com/23/playerPrices?player=${PLAYER_PRICES_ID[playerID]}`)
            .then(response => response.json())
            .then(data => {
            const psPrices = data[PLAYER_PRICES_ID[playerID]].prices.ps
            const lastPrices = Object.keys(psPrices)
              .filter(priceId => priceId.includes('LCPrice'))
              .map(priceId => psPrices[priceId])
            localStorage.setItem('refreshDate', JSON.stringify(Date.now()))
            setPlayerPrices({
              ...playerPrices,
              [PLAYER_PRICES_ID[playerID]]: lastPrices
            })
          }).catch(e => {
            localStorage.setItem('refreshDate', JSON.stringify(Date.now()))
          })
        } catch(e) {
          localStorage.setItem('refreshDate', JSON.stringify(Date.now()))
        }
      })
    }
  })

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
  const getMargin = () => Math.round((buyNowPrice * 0.95) - getNumberFromString(watch("price")))
  const getNumberFromString = (string) => string && parseFloat(string.replace(/,/g, ''))
  const formatNumber = (number) => number > 0 && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const canShowNumber = watch("price") && /^[0-9,.]*$/.test(watch("price")) && getNumberFromString(watch("price")) > 9999

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
        <div className="p-12"> Las cartas de menos de <b>{formatNumber(10000)}</b> monedas no fluctúan lo suficiente como hacer hacer flips </div>
      }
      {
        (playerPriceFF && Object.keys(PLAYER_PRICES_ID).map(playerId => <div key={playerId}>
        {( 
          playerPrices && playerPrices[PLAYER_PRICES_ID[playerId]] && 
          <div>
            El precio de {playerId} actual es {playerPrices[PLAYER_PRICES_ID[playerId]][0]}
          </div>
        )}
      </div>))
      }
      {/*  */}
    </div>
  );
}

export default App;
