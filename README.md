# Connect2 Fine Calculator
An automated fine calculator, using data from CSV files exported by Connect2.

## Usage

This uses the excellent Parcel bundler.

To run:

```bash
yarn start
```

To build:

```bash
yarn build
```

To do anything else, check package.json

## Configuration
List your resources/parent resouces alongside their daily rate in `misc/fines.json`,

Example *`misc/fines.json`*
```json
[
  {"resource": "Apple MacBook Charger", "amount": 2},
  {"resource": "Apple MacBook Pro (15-inch Retina)", "amount": 10},
  {"resource": "Canon XA20 Camcorders", "amount": 5},
  {"resource": "Computer Mouse", "amount": 2},
  {"resource": "HDMI Cable", "amount": 2},
  {"resource": "Logitech BCC950 Conference Camera", "amount": 3},
  {"resource": "Micro HDMI to HDMI Cable", "amount": 2},
  {"resource": "Toshiba Portege Z30 Ultrabook", "amount": 10},
  {"resource": "Toshiba Portege Z30 Ultrabook Charger", "amount": 2},
  {"resource": "Tripod", "amount": 5},
]
```

Configuration and customisation settings are in `misc/settings.json`

Example *`misc/settings.json`*
```json
{
  "c2Instance": "https://you.getconnect2.com/",
}
```

### Options
`c2Instancce`	The root URL of your C2 instance. Remember the trailing slash!
