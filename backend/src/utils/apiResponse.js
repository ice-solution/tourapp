export const success = (res, data = {}, status = 200) =>
  res.status(status).json({
    success: true,
    data,
  })

export const failure = (res, message = 'Something went wrong', status = 400, errors) =>
  res.status(status).json({
    success: false,
    message,
    errors,
  })


