const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const books = [];

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  // Route POST /books
  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      console.log(books); // debugging

      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const id = nanoid(16);
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id, name, year, author, summary, publisher,
        pageCount, readPage, finished, reading, insertedAt, updatedAt,
      };

      books.push(newBook);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      }).code(201);
    },
  });

  // Route GET /books (filter opsional)
  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      console.log(books); // debugging

      const {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      } = request.query;
  
      let filteredBooks = books;
  
      if (id) {
        filteredBooks = filteredBooks.filter((book) => book.id === id);
      }
  
      if (name) {
        filteredBooks = filteredBooks.filter((book) =>
          book.name.toLowerCase().includes(name.toLowerCase())
        );
      }
  
      if (year) {
        filteredBooks = filteredBooks.filter((book) => book.year === parseInt(year, 10));
      }
  
      if (author) {
        filteredBooks = filteredBooks.filter((book) =>
          book.author.toLowerCase().includes(author.toLowerCase())
        );
      }
  
      if (summary) {
        filteredBooks = filteredBooks.filter((book) =>
          book.summary.toLowerCase().includes(summary.toLowerCase())
        );
      }
  
      if (publisher) {
        filteredBooks = filteredBooks.filter((book) =>
          book.publisher.toLowerCase().includes(publisher.toLowerCase())
        );
      }
  
      if (pageCount) {
        filteredBooks = filteredBooks.filter((book) => book.pageCount === parseInt(pageCount, 10));
      }
  
      if (readPage) {
        filteredBooks = filteredBooks.filter((book) => book.readPage === parseInt(readPage, 10));
      }
  
      if (finished !== undefined) {
        filteredBooks = filteredBooks.filter((book) => book.finished === (finished === '1'));
        console.log('Filtered Finished Books:', filteredBooks);
      }    
  
      if (reading !== undefined) {
        filteredBooks = filteredBooks.filter((book) => book.reading === (reading === 'true'));
      }
  
      if (insertedAt) {
        filteredBooks = filteredBooks.filter((book) =>
          book.insertedAt.toLowerCase().includes(insertedAt.toLowerCase())
        );
      }
  
      if (updatedAt) {
        filteredBooks = filteredBooks.filter((book) =>
          book.updatedAt.toLowerCase().includes(updatedAt.toLowerCase())
        );
      }
  
      const booksResponse = filteredBooks.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      }));
  
      return h.response({
        status: 'success',
        data: {
          books: booksResponse,
        },
      }).code(200);
    },
  });

  //GET /books/{bookId}

  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      console.log(books); // debugging

      const { bookId } = request.params;
  
      const book = books.find((b) => b.id === bookId);
  
      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }
  
      return h.response({
        status: 'success',
        data: {
          book,
        },
      }).code(200);
    },
  });
  

  // Route PUT /books/{bookId}
  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      console.log(books); // debugging

      const { bookId } = request.params;
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      }

      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished: pageCount === readPage,
        updatedAt: new Date().toISOString(),
      };

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      }).code(200);
    },
  });

  // Route DELETE /books/{bookId}
  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      console.log(books); // debugging

      const { bookId } = request.params;

      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      }

      books.splice(index, 1);

      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }).code(200);
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
