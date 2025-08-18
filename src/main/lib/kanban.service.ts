import { getDb } from './database'

const db = getDb()

export const getBoardsForUser = (userId: string) => {
  return db.prepare('SELECT * FROM boards WHERE userId = ? ORDER BY createdAt DESC').all(userId)
}

export const getPublicBoards = () => {
  return db
    .prepare(
      `SELECT id, name, createdAt, authorEmail FROM boards WHERE visibility = 'public' ORDER BY createdAt DESC`
    )
    .all()
}

export const getBoardDetails = (boardId: number, userId: string) => {
  console.log('Fetching board details:', { boardId, userId })
  const board = db
    .prepare("SELECT * FROM boards WHERE id = ? AND (visibility = 'public' OR userId = ?)")
    .get(boardId, userId)
  if (!board) {
    console.log('Board not found or access denied:', { boardId, userId })
    return null
  }

  const columns = db
    .prepare('SELECT * FROM columns WHERE boardId = ? ORDER BY "order"')
    .all(boardId)

  const cards = db
    .prepare(
      'SELECT c.* FROM cards c JOIN columns col ON c.columnId = col.id WHERE col.boardId = ?'
    )
    .all(boardId)

  board.columns = columns.map((col) => ({
    ...col,
    cards: (cards.filter((card) => card.columnId === col.id) || []).sort(
      (a, b) => a.order - b.order
    )
  }))
  console.log('Board details fetched:', { boardId, columns: columns.length, cards: cards.length })
  return board
}

// --- WRITE OPERATIONS ---
export const createBoard = (
  user: { userId: string; email: string },
  { name, visibility, columns }
) => {
  const createBoardStmt = db.prepare(
    'INSERT INTO boards (userId, name, visibility, authorEmail) VALUES (?, ?, ?, ?)'
  )
  const createColumnStmt = db.prepare(
    'INSERT INTO columns (boardId, name, "order") VALUES (?, ?, ?)'
  )

  const transaction = db.transaction((boardData) => {
    const info = createBoardStmt.run(user.userId, boardData.name, boardData.visibility, user.email)
    const boardId = info.lastInsertRowid
    for (const [index, columnName] of boardData.columns.entries()) {
      createColumnStmt.run(boardId, columnName, index)
    }
    return boardId
  })

  const newBoardId = transaction({ name, visibility, columns })
  return getBoardDetails(newBoardId, user.userId)
}

export const updateBoard = (userId: string, { boardId, name, visibility }) => {
  const result = db
    .prepare('UPDATE boards SET name = ?, visibility = ? WHERE id = ? AND userId = ?')
    .run(name, visibility, boardId, userId)
  if (result.changes === 0) throw new Error('Permission denied or board not found.')
  return { success: true }
}

export const deleteBoard = (userId: string, boardId: number) => {
  const result = db.prepare('DELETE FROM boards WHERE id = ? AND userId = ?').run(boardId, userId)
  if (result.changes === 0) throw new Error('Permission denied or board not found.')
  return { success: true }
}

export const addColumn = (userId: string, { boardId, name }) => {
  const board = db.prepare('SELECT id FROM boards WHERE id = ? AND userId = ?').get(boardId, userId)
  if (!board) throw new Error('Permission denied or board not found.')

  const maxOrderResult = db
    .prepare('SELECT MAX("order") as maxOrder FROM columns WHERE boardId = ?')
    .get(boardId)
  const newOrder = (maxOrderResult.maxOrder ?? -1) + 1

  const result = db
    .prepare('INSERT INTO columns (boardId, name, "order") VALUES (?, ?, ?)')
    .run(boardId, name, newOrder)

  return db.prepare('SELECT * FROM columns WHERE id = ?').get(result.lastInsertRowid)
}

export const createCard = (userId: string, { columnId, content }) => {
  const column = db
    .prepare(
      'SELECT c.id FROM columns c JOIN boards b ON c.boardId = b.id WHERE c.id = ? AND b.userId = ?'
    )
    .get(columnId, userId)
  if (!column) throw new Error('Access denied or column not found.')
  const maxOrderResult = db
    .prepare('SELECT MAX("order") as maxOrder FROM cards WHERE columnId = ?')
    .get(columnId)
  const newOrder = (maxOrderResult.maxOrder ?? -1) + 1
  const result = db
    .prepare('INSERT INTO cards (columnId, content, "order") VALUES (?, ?, ?)')
    .run(columnId, content, newOrder)
  return db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid)
}

export const updateCardContent = (userId: string, { cardId, content }) => {
  const cardOwnerCheck = db
    .prepare(
      `SELECT b.userId FROM cards c JOIN columns col ON c.columnId = col.id JOIN boards b ON col.boardId = b.id WHERE c.id = ?`
    )
    .get(cardId)
  if (!cardOwnerCheck || cardOwnerCheck.userId !== userId) throw new Error('Permission denied.')
  db.prepare('UPDATE cards SET content = ? WHERE id = ?').run(content, cardId)
  return { success: true, id: cardId }
}

export const deleteCard = (userId: string, cardId: number) => {
  const cardOwnerCheck = db
    .prepare(
      `SELECT b.userId FROM cards c JOIN columns col ON c.columnId = col.id JOIN boards b ON col.boardId = b.id WHERE c.id = ?`
    )
    .get(cardId)
  if (!cardOwnerCheck || cardOwnerCheck.userId !== userId) throw new Error('Permission denied.')
  db.prepare('DELETE FROM cards WHERE id = ?').run(cardId)
  return { success: true, id: cardId }
}

export const moveCard = (userId: string, { cardId, newColumnId, newOrder }) => {
  console.log('moveCard called:', { userId, cardId, newColumnId, newOrder })
  const cardOwnerCheck = db
    .prepare(
      `SELECT b.userId, c.columnId as oldColumnId, c."order" as oldOrder 
       FROM cards c 
       JOIN columns col ON c.columnId = col.id 
       JOIN boards b ON col.boardId = b.id 
       WHERE c.id = ?`
    )
    .get(cardId)

  if (!cardOwnerCheck || cardOwnerCheck.userId !== userId) {
    console.error('Permission denied:', { cardId, userId })
    throw new Error('Permission denied: You do not own this card.')
  }

  const { oldColumnId, oldOrder } = cardOwnerCheck

  const moveTransaction = db.transaction(() => {
    console.log('Updating orders:', { oldColumnId, oldOrder, newColumnId, newOrder })
    db.prepare('UPDATE cards SET "order" = "order" - 1 WHERE columnId = ? AND "order" > ?').run(
      oldColumnId,
      oldOrder
    )
    db.prepare('UPDATE cards SET "order" = "order" + 1 WHERE columnId = ? AND "order" >= ?').run(
      newColumnId,
      newOrder
    )
    db.prepare('UPDATE cards SET columnId = ?, "order" = ? WHERE id = ?').run(
      newColumnId,
      newOrder,
      cardId
    )
  })

  try {
    moveTransaction()
    console.log('Card moved successfully:', { cardId, newColumnId, newOrder })
    return { success: true }
  } catch (error) {
    console.error('Failed to move card in database:', error)
    throw error
  }
}
