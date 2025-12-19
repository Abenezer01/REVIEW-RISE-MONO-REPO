/* eslint-disable import/no-unresolved */
import type { ReactNode } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  icon?: ReactNode | string
  stats: ReactNode
  title: ReactNode
  color: ThemeColor
}

const defaultData: DataType[] = [
  {
    stats: '0',
    title: 'title ',
    color: 'primary',
    icon: 'tabler-chart-pie-2'
  },
  {
    color: 'info',
    stats: '0',
    title: 'title',
    icon: 'tabler-users'
  },
  {
    color: 'error',
    stats: '0',
    title: 'title',
    icon: 'tabler-shopping-cart'
  },
  {
    color: 'success',
    stats: '0',
    title: 'title',
    icon: 'tabler-currency-dollar'
  }
]

type GridSize = Partial<{ xs: number; sm: number; md: number; lg: number; xl: number }>

const StatisticsCard = ({
  data,
  title,
  actionText,
  action,
  gridItemSize,
  onItemClick,
  renderIcon,
  classes
}: {
  data?: DataType[]
  title?: ReactNode
  actionText?: string
  action?: ReactNode
  gridItemSize?: GridSize
  onItemClick?: (item: DataType, index: number) => void
  renderIcon?: (item: DataType) => ReactNode
  classes?: { root?: string; header?: string; content?: string; item?: string }
}) => {
  const items = data ?? defaultData

  return (
    <Card className={classes?.root}>
      <CardHeader
        title={title ?? 'Statistics'}
        className={classes?.header}
        action={
          action ?? (
            <Typography variant='subtitle2' color='text.disabled'>
              {actionText ?? 'Updated 1 month ago'}
            </Typography>
          )
        }
      />
      <CardContent className={classes?.content ? 'flex justify-between flex-wrap gap-4 ' + classes.content : 'flex justify-between flex-wrap gap-4'}>
        <Grid container spacing={4} flex={1}>
          {items.map((item, index) => (
            <Grid
              size={gridItemSize ?? { xs: 6, md: 3 }}
              key={index}
              className={classes?.item ? 'flex gap-4 items-center ' + classes.item : 'flex gap-4 items-center'}
              onClick={() => onItemClick?.(item, index)}
            >
              <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                {renderIcon
                  ? renderIcon(item)
                  : typeof item.icon === 'string'
                    ? <i className={item.icon}></i>
                    : item.icon}
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography variant='body2'>{item.title}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
