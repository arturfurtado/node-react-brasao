import { AppDataSource } from './config/data-source';

AppDataSource.initialize()
  .then(() => {
    console.log('inicializado!');
  })
  .catch((err) => {
    console.error('Error:', err);
  });
